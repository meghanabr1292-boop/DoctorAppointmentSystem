import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Login from "./pages/login";
import Register from "./pages/register";
import Doctors from "./pages/Doctors";
import BookAppointment from "./pages/BookAppointment";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useEffect(() => {
    function updateLoginState() {
      setIsLoggedIn(Boolean(localStorage.getItem("token")));
    }

    window.addEventListener("authChanged", updateLoginState);
    return () => window.removeEventListener("authChanged", updateLoginState);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    window.location.href = "/login";
  }

  return (
    <BrowserRouter>
      <nav>
        <div style={{ color: "white", fontSize: "22px", fontWeight: "bold", marginBottom: "12px" }}>
          DOCTOR APPOINTMENT SYSTEM
        </div>

        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link> |{" "}
            <Link to="/register">Register</Link>
          </>
        ) : (
          <>
            <Link to="/patient-dashboard">Patient Dashboard</Link> |{" "}
            <Link to="/doctors">Doctors</Link> |{" "}
            <Link to="/book-appointment">Book Appointment</Link>{" "}
            <button type="button" onClick={handleLogout}>Logout</button>
          </>
        )}
      </nav>

      <Routes>
        <Route
          path="/"
          element={isLoggedIn ? <PatientDashboard /> : <Login />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/book-appointment" element={<BookAppointment />} />
        <Route path="/patient-dashboard" element={<PatientDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>

      <footer
        style={{
          marginTop: "40px",
          padding: "24px",
          textAlign: "center",
          background: "#153b66",
          color: "white"
        }}
      >
        <p>Doctor Appointment System</p>
        <p>Helping patients manage doctor appointments.</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;