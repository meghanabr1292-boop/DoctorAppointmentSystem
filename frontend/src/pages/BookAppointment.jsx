import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

function BookAppointment() {
  const [searchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState(
    searchParams.get("doctorId") || ""
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    fetch("http://localhost:5001/api/doctors")
      .then((response) => {
        if (!response.ok) throw new Error("Could not load doctors.");
        return response.json();
      })
      .then(setDoctors)
      .catch(() => setMessage("Could not load doctors."));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please log in before booking.");
      return;
    }

    setMessage("Saving appointment...");
    setConfirmation(null);

    try {
      const response = await fetch("http://localhost:5001/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ doctorId, date, time })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not save appointment.");
      }

      const selectedDoctor = doctors.find(
        (doctor) => String(doctor.id) === String(doctorId)
      );

      setMessage("");
      setConfirmation({ doctor: selectedDoctor, date, time });
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <div>
      <h1>Book Appointment</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Select Doctor
          <br />
          <select
            value={doctorId}
            onChange={(event) => setDoctorId(event.target.value)}
            required
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
        </label>

        <br />
        <br />

        <label>
          Appointment Date
          <br />
          <input
            type="date"
            min={minDate}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>

        <br />
        <br />

        <label>
          Appointment Time
          <br />
          <select
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          >
            <option value="">Choose a time</option>
            <option value="09:00">09:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="13:00">01:00 PM</option>
            <option value="14:00">02:00 PM</option>
            <option value="15:00">03:00 PM</option>
          </select>
        </label>

        <br />
        <br />

        <button type="submit">Book Appointment</button>
      </form>

      {message && <p>{message}</p>}

      {confirmation && (
        <section>
          <h2>Appointment Confirmed</h2>
          <p>Doctor: {confirmation.doctor?.name}</p>
          <p>Specialization: {confirmation.doctor?.specialization}</p>
          <p>Date: {confirmation.date}</p>
          <p>Time: {confirmation.time}</p>
        </section>
      )}
    </div>
  );
}

export default BookAppointment;