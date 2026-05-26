import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import {
  HiOutlineLockClosed,
  HiOutlineUser
} from "react-icons/hi";

import {
  FiEye,
  FiEyeOff
} from "react-icons/fi";

import "../styles/Auth.css";

function Login({ setLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      const res = await api.post("auth/login/", {
        username,
        password
      });

      localStorage.setItem("token", res.data.access);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.username);

      setLoggedIn(true);
      navigate(res.data.role === "ADMIN" ? "/dashboard" : "/scan", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Invalid credentials"
      );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <HiOutlineLockClosed />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to continue</p>
        </div>

        <div className="input-group">
          <HiOutlineUser className="input-icon" />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <HiOutlineLockClosed className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {showPassword ? (
            <FiEye
              className="eye-icon"
              onClick={() => setShowPassword(false)}
            />
          ) : (
            <FiEyeOff
              className="eye-icon"
              onClick={() => setShowPassword(true)}
            />
          )}
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="auth-options">
          <label>
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <button className="text-btn">Forgot password?</button>
        </div>

        <button className="primary-btn" onClick={handleLogin}>
          Login
        </button>

        <p className="auth-switch">
          Don’t have an account?{' '}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
