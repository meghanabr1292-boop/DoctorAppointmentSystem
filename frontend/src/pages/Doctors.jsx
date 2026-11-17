import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Doctors.css";

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [message, setMessage] = useState("Loading doctors...");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:5001/api/doctors")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load doctors");
        return response.json();
      })
      .then((data) => {
        setDoctors(data);
        setMessage("");
      })
      .catch(() => setMessage("Unable to load doctors. Please try again."));
  }, []);

  const filteredDoctors = doctors.filter((doctor) => {
    const searchText = search.toLowerCase();
    return (
      doctor.name.toLowerCase().includes(searchText) ||
      doctor.specialization.toLowerCase().includes(searchText)
    );
  });

  return (
    <main className="doctors-page">
      <h1>Meet Our Doctors</h1>
      <p className="doctors-intro">Choose a specialist and book your visit.</p>

      <p className="doctor-count">
        {filteredDoctors.length} doctor
        {filteredDoctors.length === 1 ? "" : "s"} found
      </p>

      <input
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by doctor or specialty"
        aria-label="Search doctors by name or specialty"
        style={{
          width: "min(100%, 420px)",
          padding: "12px",
          marginBottom: "28px",
          border: "1px solid #cbd5e1",
          borderRadius: "10px",
          fontSize: "16px"
        }}
      />

      {message && <p>{message}</p>}

      <div className="doctor-grid">
        {filteredDoctors.map((doctor) => (
          <article className="doctor-card" key={doctor.id}>
            <div className="doctor-avatar" aria-hidden="true">
              {doctor.name?.charAt(0) || "D"}
            </div>
            <h2>{doctor.name}</h2>
            <p className="doctor-specialty">{doctor.specialization}</p>
            <p>{doctor.experience} experience</p>
            <Link
              className="doctor-book-button"
              to={`/book-appointment?doctorId=${doctor.id}`}
            >
              Book Appointment
            </Link>
          </article>
        ))}
      </div>

      {!message && filteredDoctors.length === 0 && (
        <p>No doctors match your search.</p>
      )}
    </main>
  );
}

export default Doctors;