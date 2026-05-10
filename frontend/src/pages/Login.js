import React, { useState } from "react";
import api from "../api/axios";

function Login({ setLoggedIn, setPage }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const[error,setError]=useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("auth/login/", {
        username,
        password
      });

    localStorage.setItem("token", res.data.access);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username", res.data.username);
      setLoggedIn(true);

    } catch (err) {
    setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="auth-container">

      <div className="card">
        <h2>Login</h2>

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
        {/* 🚨 ERROR MESSAGE HERE */}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <button className="action" onClick={handleLogin}>
          Login
        </button>

        <p style={{marginTop:"10px"}}>
          Don’t have an account?{" "}
          <span
            style={{color:"blue", cursor:"pointer"}}
            onClick={() => setPage("register")}
          >
            Register
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;