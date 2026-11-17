import { useEffect, useState } from "react";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminData() {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(
          "http://localhost:5001/api/admin/overview",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load admin data.");
        }

        setUsers(data.users || []);
        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {loading && <p>Loading dashboard...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <>
          <h2>Users</h2>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            users.map((user) => (
              <div key={user.id}>
                <h3>{user.name}</h3>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <hr />
              </div>
            ))
          )}

          <h2>All Appointments</h2>
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id}>
                <h3>{appointment.patientName}</h3>
                <p>Doctor: {appointment.doctorName}</p>
                <p>Date: {appointment.date}</p>
                <p>Time: {appointment.time}</p>
                <p>Status: {appointment.status}</p>
                <hr />
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default AdminDashboard;