import { useCallback, useEffect, useState } from "react";

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [doctorName, setDoctorName] = useState("Doctor");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadAppointments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in with a doctor account.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5001/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load appointments.");
      setAppointments(data.appointments || []);
      setDoctorName(data.doctorName || "Doctor");
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  async function updateStatus(appointmentId, status) {
    const token = localStorage.getItem("token");
    setUpdatingId(appointmentId);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5001/api/doctor/appointments/${appointmentId}/status`,
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
      if (!response.ok) throw new Error(data.message || "Could not update appointment.");

      setAppointments((current) => current.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, status } : appointment
      ));
      setMessage(data.message || "Appointment status updated.");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div>
      <h1>Doctor Dashboard</h1>
      <h2>{doctorName}'s Appointments</h2>

      {loading && <p>Loading appointments...</p>}
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      {!loading && !error && appointments.length === 0 && (
        <p>No appointments have been booked with your doctor profile yet.</p>
      )}

      {appointments.map((appointment) => (
        <section key={appointment.id}>
          <h3>Patient: {appointment.patientName || "Patient"}</h3>
          <p>Date: {appointment.date}</p>
          <p>Time: {appointment.time}</p>
          <p>Status: {appointment.status}</p>
          {appointment.status === "Pending" ? (
            <>
              <button
                type="button"
                disabled={updatingId === appointment.id}
                onClick={() => updateStatus(appointment.id, "Confirmed")}
              >
                Confirm appointment
              </button>{" "}
              <button
                type="button"
                disabled={updatingId === appointment.id}
                onClick={() => updateStatus(appointment.id, "Cancelled")}
              >
                Cancel appointment
              </button>
            </>
          ) : null}
          <hr />
        </section>
      ))}
    </div>
  );
}

export default DoctorDashboard;
