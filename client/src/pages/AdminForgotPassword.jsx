import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope } from "react-icons/fa";
import "./login.css";
import { useNavigate } from "react-router-dom";

function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.post("https://web-development-project-gxnx.onrender.com/api/auth/admin-forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      console.error("Admin forgot password error:", err);
      setError(err.response?.data?.error || "Something went wrong.");
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Admin Forgot Password</h2>
        <p className="login-subtitle">
          Enter your email to receive reset instructions.
        </p>

        {message && <div className="success-text">{message}</div>}
        {error && <div className="error-text">{error}</div>}

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

        <button type="submit" className="login-btn">
          Send Reset Link
        </button>

        <p className="login-subtitle" style={{ marginTop: "1rem" }}>
          <a href="/admin-login">Back to Admin Login</a>
        </p>
      </form>
    </div>
  );
}

export default AdminForgotPassword;
