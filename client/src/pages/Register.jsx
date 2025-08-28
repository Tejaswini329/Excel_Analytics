import React, { useState } from "react";
import axios from "axios";
import {
  FaEnvelope,
  FaLock,
  FaUser,
} from "react-icons/fa";
import "./login.css";
import { useNavigate } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [error, setError] = useState("");
  const [tempUserId, setTempUserId] = useState(null);
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
      const res = await axios.post("https://web-development-project-gxnx.onrender.com/api/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      // Show OTP input
      setTempUserId(res.data.tempUserId); // Store temp ID if needed for verification
      setShowOtpInput(true);
      alert("📩 OTP sent to your email. Please verify.");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.error || "❌ Server error during registration.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await axios.post("https://web-development-project-gxnx.onrender.com/api/auth/verify-otp", {
        email: form.email,
        otp: otp,
        tempUserId,
      });

      alert("✅ Registration complete!");
      navigate("/login");
    } catch (err) {
      console.error("OTP verification error:", err);
      setError(err.response?.data?.error || "❌ Invalid OTP.");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={showOtpInput ? handleVerifyOtp : handleSubmit}>
        <h2 className="login-title">Create Account</h2>
        <p className="login-subtitle">
          Already have an account? <a href="/login">Sign in</a>
        </p>

        {error && <div className="error-text">{error}</div>}

        {!showOtpInput ? (
          <>
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
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
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="login-btn">Sign Up</button>
          </>
        ) : (
          <>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">Verify OTP</button>
          </>
        )}
      </form>
    </div>
  );
}

export default Register;
