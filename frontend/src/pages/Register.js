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

function Register() {

  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const navigate = useNavigate();

  const handleRegister = async () => {

    setError("");
    setSuccess("");

    if (!username.trim() || !password) {

      setError(
        "Username and password are required"
      );

      return;
    }

    try {

      await api.post("auth/register/", {
        username,
        password
      });

      setSuccess(
        "Registered successfully! Redirecting..."
      );

      setTimeout(() => {

        navigate("/login", {
          replace: true
        });

      }, 1500);

    } catch (err) {

      setError(
        err.response?.data?.error ||
        err.response?.data?.username?.[0] ||
        err.response?.data?.password?.[0] ||
        "Registration failed"
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

          <h1>Create Account</h1>

          <p>Register to continue</p>
        </div>

        <div className="input-group">

          <HiOutlineUser className="input-icon" />

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
          />
        </div>

        <div className="input-group">

          <HiOutlineLockClosed className="input-icon" />

          <input
            type={
              showPassword
                ? "text"
                : "password"
            }
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          {showPassword ? (

            <FiEye
              className="eye-icon"
              onClick={() =>
                setShowPassword(false)
              }
            />

          ) : (

            <FiEyeOff
              className="eye-icon"
              onClick={() =>
                setShowPassword(true)
              }
            />
          )}
        </div>

        {error && (
          <p className="error-text">
            {error}
          </p>
        )}

        {success && (
          <p className="success-text">
            {success}
          </p>
        )}

        <button
          className="primary-btn"
          onClick={handleRegister}
        >
          Register
        </button>

        <p className="auth-switch">

          Already have an account?{" "}

          <span
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;