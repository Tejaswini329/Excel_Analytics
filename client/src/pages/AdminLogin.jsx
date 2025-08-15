// src/components/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './AdminLogin.css';

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/admin-login', form);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('role', 'admin');
      localStorage.setItem('userId', res.data.userId);
      navigate('/admin-dashboard');
    } catch (err) {
      const msg = err?.response?.data?.error ?? 'Server error';
      alert(`Admin login failed: ${msg}`);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>
        
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {/* Forgot Password link - aligned left */}
        <div style={{ textAlign: "left", marginBottom: "10px" }}>
          <button
            type="button"
            onClick={() => navigate('/admin-forgot-password')}
            style={{
              background: "none",
              border: "none",
              color: "#007BFF",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.9rem",
              textDecoration: "underline"
            }}
          >
            Forgot Password?
          </button>
        </div>

        <button type="submit">Login</button>

        {/* Register link */}
        <div style={{ textAlign: "center", marginTop: "10px" }}>
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/admin-register')}
            style={{
              background: "none",
              border: "none",
              color: "#007BFF",
              cursor: "pointer",
              padding: 0,
              fontSize: "0.9rem",
              textDecoration: "underline"
            }}
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminLogin;
