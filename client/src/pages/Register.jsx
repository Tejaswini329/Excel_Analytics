import React, { useState } from "react";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaApple,
  FaTimes,
} from "react-icons/fa";
import "./Login.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
  const res = await axios.post("http://localhost:5000/api/auth/register", {
    username: form.username,
    email: form.email,
    password: form.password,
  });

  alert("✅ Registration successful!");
  console.log("Registered User ID:", res.data.userId);
  navigate("/login"); // Redirect to login page 🎯
} catch (err) {
  

      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || "❌ Server error during registration."
      );
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <div className="logo-circle"></div>
        </div>
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        {error && <div className="error-text">{error}</div>}

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>

        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <button type="submit" className="login-btn">
          Sign Up
        </button>

        

        
      </form>
    </div>
  );
}

export default Register;
