const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./config/db");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from backend/.env");
}

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;
const JWT_SECRET = process.env.JWT_SECRET;

const doctors = [
  { id: 1, name: "Dr. Ravi Kumar", specialization: "Cardiologist", experience: "10 Years" },
  { id: 2, name: "Dr. Priya Sharma", specialization: "Dermatologist", experience: "7 Years" },
  { id: 3, name: "Dr. Arjun Rao", specialization: "General Physician", experience: "8 Years" }
];

function makeToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role || "patient",
      doctorId: user.doctor_id || null
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function requireLogin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return res.status(401).json({ message: "Please log in first." });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Your login expired. Please log in again." });
  }
}

function requireDoctor(req, res, next) {
  if (req.user.role !== "doctor" || !req.user.doctorId) {
    return res.status(403).json({ message: "A doctor account is required." });
  }
  next();
}
function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "An admin account is required." });
  }
  next();
}
app.get("/api/admin/overview", requireLogin, requireAdmin, (req, res) => {
  db.query(
    "SELECT id, full_name, email, role FROM users ORDER BY id DESC",
    (usersError, users) => {
      if (usersError) {
        console.error("Could not load users:", usersError.message);
        return res.status(500).json({ message: "Could not load users." });
      }

      const sql = `
        SELECT
          appointments.id,
          appointments.doctor_id,
          appointments.appointment_date,
          appointments.appointment_time,
          appointments.status,
          users.full_name AS patient_name
        FROM appointments
        LEFT JOIN users ON users.id = appointments.patient_id
        ORDER BY appointments.id DESC
      `;

      db.query(sql, (appointmentsError, rows) => {
        if (appointmentsError) {
          console.error("Could not load appointments:", appointmentsError.message);
          return res.status(500).json({ message: "Could not load appointments." });
        }

        const doctorById = Object.fromEntries(
          doctors.map((doctor) => [doctor.id, doctor])
        );

        res.json({
          users: users.map((user) => ({
            id: user.id,
            name: user.full_name,
            email: user.email,
            role: user.role
          })),
          appointments: rows.map((row) => {
            const doctor = doctorById[row.doctor_id];

            return {
              id: row.id,
              patientName: row.patient_name || "Unknown patient",
              doctorName: doctor ? doctor.name : "Unknown doctor",
              date: row.appointment_date,
              time: row.appointment_time,
              status: row.status
            };
          })
        });
      });
    }
  );
});
app.get("/", (req, res) => {
  res.send("Doctor Appointment System API is running");
});

app.get("/api/doctors", (req, res) => {
  res.json(doctors);
});

app.post("/api/register", async (req, res) => {
  const fullName = (req.body.fullName || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  const role = req.body.role === "doctor" ? "doctor" : "patient";
  const doctorId = role === "doctor" ? Number(req.body.doctorId) : null;

  if (!fullName || !email || password.length < 8) {
    return res.status(400).json({
      message: "Enter your name, a valid email, and a password of at least 8 characters."
    });
  }

  if (role === "doctor" && !doctors.some((doctor) => doctor.id === doctorId)) {
    return res.status(400).json({ message: "Please choose a doctor profile." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    db.query(
      "INSERT INTO users (full_name, email, password_hash, role, doctor_id) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, passwordHash, role, doctorId],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "That email is already registered." });
          }
          console.error("Registration error:", err.message);
          return res.status(500).json({ message: "Could not register this account." });
        }

        const user = {
          id: result.insertId,
          full_name: fullName,
          email,
          role,
          doctor_id: doctorId
        };
        return res.status(201).json({
          message: "Registration successful.",
          token: makeToken(user),
          user: { name: fullName, email, role }
        });
      }
    );
  } catch (err) {
    console.error("Registration error:", err.message);
    res.status(500).json({ message: "Could not register this account." });
  }
});

app.post("/api/login", (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  db.query(
    "SELECT id, full_name, email, password_hash, role, doctor_id FROM users WHERE email = ?",
    [email],
    async (err, rows) => {
      if (err) {
        console.error("Login error:", err.message);
        return res.status(500).json({ message: "Could not log in." });
      }

      if (!rows.length || !(await bcrypt.compare(password, rows[0].password_hash))) {
        return res.status(401).json({ message: "Email or password is incorrect." });
      }

      const user = rows[0];
      return res.json({
        message: "Login successful.",
        token: makeToken(user),
        user: { name: user.full_name, email: user.email, role: user.role }
      });
    }
  );
});
console.log("Login route loaded");
app.post("/api/appointments", requireLogin, (req, res) => {
  const { doctorId, date, time } = req.body;

  if (!doctorId || !date || !time) {
    return res.status(400).json({ message: "Please select a doctor, date, and time." });
  }

  db.query(
    "INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, doctorId, date, time, "Pending"],
    (err, result) => {
      if (err) {
        console.error("Error saving appointment:", err.message);
        return res.status(500).json({ message: "Could not save the appointment." });
      }

      res.status(201).json({
        message: "Appointment saved successfully.",
        appointmentId: result.insertId
      });
    }
  );
});

app.get("/api/appointments", requireLogin, (req, res) => {
  const sql = `
    SELECT id, doctor_id,
      DATE_FORMAT(appointment_date, '%Y-%m-%d') AS date,
      TIME_FORMAT(appointment_time, '%h:%i %p') AS time,
      status
    FROM appointments
    WHERE patient_id = ?
    ORDER BY id DESC
  `;

  db.query(sql, [req.user.id], (err, rows) => {
    if (err) {
      console.error("Error loading appointments:", err.message);
      return res.status(500).json({ message: "Could not load appointments." });
    }

    const doctorById = Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor]));
    const appointments = rows.map((item) => {
      const doctor = doctorById[item.doctor_id];
      return {
        id: item.id,
        doctorName: doctor ? doctor.name : "Unknown doctor",
        specialization: doctor ? doctor.specialization : "",
        date: item.date,
        time: item.time,
        status: item.status
      };
    });

    res.json({ appointments });
  });
});

app.patch("/api/appointments/:id/status", requireLogin, (req, res) => {
  const appointmentId = Number(req.params.id);
  const { status } = req.body;
  const allowedStatuses = ["Pending", "Confirmed", "Cancelled"];

  if (!Number.isInteger(appointmentId) || appointmentId < 1) {
    return res.status(400).json({ message: "Invalid appointment." });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Choose a valid appointment status." });
  }

  db.query(
    "UPDATE appointments SET status = ? WHERE id = ? AND patient_id = ?",
    [status, appointmentId, req.user.id],
    (err, result) => {
      if (err) {
        console.error("Error updating appointment status:", err.message);
        return res.status(500).json({ message: "Could not update the appointment." });
      }

      if (!result.affectedRows) {
        db.query(
          "SELECT id FROM appointments WHERE id = ? AND patient_id = ?",
          [appointmentId, req.user.id],
          (lookupError, rows) => {
            if (lookupError) {
              console.error("Error checking appointment:", lookupError.message);
              return res.status(500).json({ message: "Could not update the appointment." });
            }
            if (!rows.length) {
              return res.status(404).json({ message: "Appointment not found." });
            }
            return res.json({ message: "Appointment status updated.", status });
          }
        );
        return;
      }

      res.json({ message: "Appointment status updated.", status });
    }
  );
});

console.log("Doctor appointments route loaded");
app.get("/api/doctor/appointments", requireLogin, requireDoctor, (req, res) => {
  const sql = `
    SELECT a.id, u.full_name AS patientName,
      DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
      TIME_FORMAT(a.appointment_time, '%h:%i %p') AS time,
      a.status
    FROM appointments a
    JOIN users u ON u.id = a.patient_id
    WHERE a.doctor_id = ?
    ORDER BY a.appointment_date, a.appointment_time
  `;

  db.query(sql, [req.user.doctorId], (err, appointments) => {
    if (err) {
      console.error("Error loading doctor appointments:", err.message);
      return res.status(500).json({ message: "Could not load doctor appointments." });
    }
    res.json({ appointments, doctorName: req.user.name });
  });
});

app.patch("/api/doctor/appointments/:id/status", requireLogin, requireDoctor, (req, res) => {
  const appointmentId = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(appointmentId) || appointmentId < 1) {
    return res.status(400).json({ message: "Invalid appointment." });
  }
  if (!["Confirmed", "Cancelled"].includes(status)) {
    return res.status(400).json({ message: "Choose Confirmed or Cancelled." });
  }

  db.query(
    "UPDATE appointments SET status = ? WHERE id = ? AND doctor_id = ?",
    [status, appointmentId, req.user.doctorId],
    (err, result) => {
      if (err) {
        console.error("Error updating doctor appointment:", err.message);
        return res.status(500).json({ message: "Could not update the appointment." });
      }
      if (!result.affectedRows) {
        return db.query(
          "SELECT id FROM appointments WHERE id = ? AND doctor_id = ?",
          [appointmentId, req.user.doctorId],
          (lookupError, rows) => {
            if (lookupError) {
              console.error("Error checking doctor appointment:", lookupError.message);
              return res.status(500).json({ message: "Could not update the appointment." });
            }
            if (!rows.length) {
              return res.status(404).json({ message: "Appointment not found." });
            }
            return res.json({ message: "Appointment status updated.", status });
          }
        );
      }
      res.json({ message: "Appointment status updated.", status });
    }
  );
});

function startServer() {
  db.query(
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(120) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'patient',
      doctor_id INT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Could not create users table:", err.message);
        return;
      }

      const ensureUserColumn = (column, definition, next) => {
        db.query(`SHOW COLUMNS FROM users LIKE '${column}'`, (columnError, rows) => {
          if (columnError) {
            console.error(`Could not check users.${column}:`, columnError.message);
            return;
          }
          if (rows.length) return next();
          db.query(`ALTER TABLE users ADD COLUMN ${column} ${definition}`, (alterError) => {
            if (alterError) {
              console.error(`Could not add users.${column}:`, alterError.message);
              return;
            }
            next();
          });
        });
      };

      const ensureAppointmentPatientId = () => db.query("SHOW COLUMNS FROM appointments LIKE 'patient_id'", (columnError, rows) => {
        if (columnError) {
          console.error("Could not check appointments table:", columnError.message);
          return;
        }

        const startListening = () => {
          app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
          });
        };

        if (rows.length) {
          startListening();
        } else {
          db.query("ALTER TABLE appointments ADD COLUMN patient_id INT NULL", (alterError) => {
            if (alterError) {
              console.error("Could not update appointments table:", alterError.message);
              return;
            }
            startListening();
          });
        }
      });

      ensureUserColumn("role", "VARCHAR(20) NOT NULL DEFAULT 'patient'", () => {
        ensureUserColumn("doctor_id", "INT NULL", ensureAppointmentPatientId);
      });
    }
  );
}

startServer();
