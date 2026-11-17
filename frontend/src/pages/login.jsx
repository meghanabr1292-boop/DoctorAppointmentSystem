import { useState } from "react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleLogin(event) {
    event.preventDefault();
    setMessage("Logging in...");

    try {
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Server reply: ${responseText.slice(0, 200)}`);
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed.");
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
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
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
          Password
          <br />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={updateField}
            required
          />
        </label>

        <br />
        <br />

        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;