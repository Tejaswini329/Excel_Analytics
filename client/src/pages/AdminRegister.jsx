// src/pages/AdminRegister.jsx
import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../pages/login.css";

export default function AdminRegister() {
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=password
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [tempId, setTempId] = useState(null);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Step 1: send OTP to email
  const sendOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!email) return setError("Email is required");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin-register-email", { email, username });
      setTempId(res.data.tempId);
      setStep(2);
      alert("OTP sent to your email. It expires in 3 minutes.");
    } catch (err) {
      console.error("sendOtp error:", err);
      setError(err?.response?.data?.error ?? "Failed to send OTP");
    }
  };

  // Step 2: verify OTP
  const verifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otp) return setError("Enter the OTP");
    try {
      await axios.post("http://localhost:5000/api/auth/admin-verify-otp", { tempId, email, otp });
      setStep(3);
      alert("OTP verified — now set your password.");
    } catch (err) {
      console.error("verifyOtp error:", err);
      setError(err?.response?.data?.error ?? "Invalid or expired OTP");
    }
  };

  // Step 3: complete registration (set password)
  const completeRegistration = async (e) => {
    e?.preventDefault();
    setError("");
    if (!password || !confirmPassword) return setError("Enter and confirm password");
    if (password !== confirmPassword) return setError("Passwords do not match");
    try {
      await axios.post("http://localhost:5000/api/auth/admin-complete-register", {
        tempId,
        email,
        username,
        password
      });
      alert("Admin account created. Please log in.");
      navigate("/admin-login");
    } catch (err) {
      console.error("completeRegistration error:", err);
      setError(err?.response?.data?.error ?? "Failed to complete registration");
    }
  };

  return (
    <div className="login-bg">
      <form
        className="login-card"
        onSubmit={step === 1 ? sendOtp : step === 2 ? verifyOtp : completeRegistration}
      >
        <h2 className="login-title">Admin Sign Up</h2>
        <p className="login-subtitle">
          Already have an account? <a href="/admin-login">Sign in</a>
        </p>

        {error && <div className="error-text">{error}</div>}

        {step === 1 && (
          <>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="username"
                placeholder="Username (optional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <button type="submit" className="login-btn">Send OTP</button>
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ marginBottom: 8 }}>An OTP was sent to <b>{email}</b>. It expires in 3 minutes.</p>
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

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="login-btn" style={{ flex: 1 }}>Verify OTP</button>
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(""); }}
                style={{ flex: 1, background: '#eee', border: 'none', borderRadius: 8, cursor: 'pointer' }}
              >
                Edit Email
              </button>
            </div>

            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  try {
                    // resend by calling sendOtp again
                    const res = await axios.post("http://localhost:5000/api/auth/admin-register-email", { email, username });
                    setTempId(res.data.tempId);
                    alert("OTP resent to your email.");
                  } catch (err) {
                    console.error("resend error:", err);
                    setError(err?.response?.data?.error ?? "Failed to resend OTP");
                  }
                }}
                style={{ background: 'none', border: 'none', color: '#0078d7', textDecoration: 'underline', cursor: 'pointer' }}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="login-btn">Complete Registration</button>
          </>
        )}
      </form>
    </div>
  );
}
