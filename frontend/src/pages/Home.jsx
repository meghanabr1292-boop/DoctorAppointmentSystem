import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <main
        style={{
          maxWidth: "900px",
          margin: "50px auto",
          padding: "40px 24px",
          textAlign: "center",
          background: "#f0f9ff",
          borderRadius: "20px"
        }}
      >
        <p style={{ color: "#087e8b", fontWeight: "bold" }}>
          YOUR HEALTH, OUR PRIORITY
        </p>

        <h1 style={{ color: "#153b66", fontSize: "2.5rem" }}>
          Doctor Appointment System
        </h1>

        <h2>Book your doctor appointment with ease</h2>

        <p style={{ color: "#64748b", fontSize: "1.1rem" }}>
          Find a specialist, choose a convenient time, and manage your
          appointments in one place.
        </p>

        <div style={{ marginTop: "28px" }}>
          <Link
            to="/doctors"
            style={{
              display: "inline-block",
              margin: "8px",
              padding: "13px 22px",
              borderRadius: "9px",
              background: "#087e8b",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Find a Doctor
          </Link>

          <Link
            to="/book-appointment"
            style={{
              display: "inline-block",
              margin: "8px",
              padding: "13px 22px",
              borderRadius: "9px",
              background: "#153b66",
              color: "white",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Book Appointment
          </Link>
        </div>
      </main>

      <section style={{ maxWidth: "900px", margin: "30px auto", padding: "24px" }}>
        <h2>About Us</h2>
        <p>
          Our Doctor Appointment System helps patients find doctors, book
          appointments, and view appointment updates in one place.
        </p>

        <h2>Contact</h2>
        <p>
          To arrange a visit, browse the doctor list or use the appointment
          booking form.
        </p>
        <Link to="/doctors">View our doctors</Link>
      </section>
    </>
  );
}

export default Home;