import React, { useState } from "react";
import api from "../api/axios";

function Register({ setPage }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {

      await api.post("auth/register/", {
        username,
        password
      });

      alert("Registered successfully!");
      setPage("login");

    } catch {
      alert("Error registering user");
    }
  };

  return (
    <div className="auth-container">

      <div className="card">
        <h2>Register</h2>

        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="action" onClick={handleRegister}>
          Register
        </button>

        <p style={{marginTop:"10px"}}>
          Already have an account?{" "}
          <span
            style={{color:"blue", cursor:"pointer"}}
            onClick={() => setPage("login")}
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Register;