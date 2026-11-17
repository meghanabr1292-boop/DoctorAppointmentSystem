import { useEffect, useState } from "react";
import "./PatientDashboard.css";

function PatientDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusEdits, setStatusEdits] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function fetchAppointments() {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please log in first.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5001/api/appointments", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load appointments.");
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, []);

  async function updateAppointmentStatus(appointmentId, status) {
    const token = localStorage.getItem("token");
    setBusyId(appointmentId);
    setActionMessage("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/appointments/${appointmentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not update appointment.");
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: data.status }
            : appointment
        )
      );

      setStatusEdits((current) => {
        const next = { ...current };
        delete next[appointmentId];
        return next;
      });
      setActionMessage(data.message);
    } catch (err) {
      setActionMessage(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="dashboard-page">
      <h1>Patient Dashboard</h1>
      <p className="dashboard-intro">View and manage your appointments.</p>
      <h2>My Appointments</h2>

      {loading && <p>Loading appointments...</p>}
      {error && <p className="dashboard-message">{error}</p>}
      {actionMessage && (
        <p className="dashboard-message" role="status">
          {actionMessage}
        </p>
      )}

      {!loading && !error && appointments.length === 0 && (
        <p>No appointments for this account yet.</p>
      )}

      <div className="appointment-grid">
        {appointments.map((appointment) => (
          <article className="appointment-card" key={appointment.id}>
            <div className="appointment-heading">
              <h3>{appointment.doctorName}</h3>
              <span
                className={`status-badge status-${appointment.status
                  ?.toLowerCase()
                  .replace(/\s+/g, "-")}`}
              >
                {appointment.status}
              </span>
            </div>

            <p>
              <strong>Specialization:</strong>{" "}
              {appointment.specialization || "General"}
            </p>
            <p><strong>Date:</strong> {appointment.date}</p>
            <p><strong>Time:</strong> {appointment.time}</p>

            <label>
              Change status
              <select
                value={statusEdits[appointment.id] ?? appointment.status}
                onChange={(event) =>
                  setStatusEdits((current) => ({
                    ...current,
                    [appointment.id]: event.target.value
                  }))
                }
                disabled={busyId === appointment.id}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </label>

            <div className="appointment-actions">
              <button
                type="button"
                onClick={() =>
                  updateAppointmentStatus(
                    appointment.id,
                    statusEdits[appointment.id] ?? appointment.status
                  )
                }
                disabled={busyId === appointment.id}
              >
                {busyId === appointment.id ? "Saving..." : "Update status"}
              </button>

              <button
                className="cancel-button"
                type="button"
                onClick={() =>
                  updateAppointmentStatus(appointment.id, "Cancelled")
                }
                disabled={
                  busyId === appointment.id ||
                  appointment.status === "Cancelled"
                }
              >
                {appointment.status === "Cancelled"
                  ? "Cancelled"
                  : "Cancel appointment"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

export default PatientDashboard;