import { useEffect, useState } from "react";

function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "patient",
    doctorId: ""
  });
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/doctors")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load doctor profiles.");
        return response.json();
      })
      .then(setDoctors)
      .catch(() =>
        setMessage("Could not load doctor profiles. Check that the backend is running.")
      );
  }, []);

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleRegister(event) {
    event.preventDefault();
    setMessage("Registering...");

    try {
      const response = await fetch("http://localhost:5001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed.");
      }

      localStorage.setItem("token", data.token);
      window.dispatchEvent(new Event("authChanged"));
      window.location.href = "/patient-dashboard";
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <label>
          Account type
          <br />
          <select name="role" value={form.role} onChange={updateField}>
            <option value="patient">Patient</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>

        <br />
        <br />

        {form.role === "doctor" && (
          <>
            <label>
              Doctor profile
              <br />
              <select
                name="doctorId"
                value={form.doctorId}
                onChange={updateField}
                required
              >
                <option value="">Choose your doctor profile</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </label>

            <br />
            <br />
          </>
        )}

        <label>
          Full Name
          <br />
          <input
            name="fullName"
            value={form.fullName}
            onChange={updateField}
            required
          />
        </label>

        <br />
        <br />

        <label>
          Email
          <br />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={updateField}
            required
          />
        </label>

        <br />
        <br />

        <label>
          Password (at least 8 characters)
          <br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            minLength={8}
            required
          />
        </label>

        <br />
        <br />

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;