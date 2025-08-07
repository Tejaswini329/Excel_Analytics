import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaApple, FaGoogle, FaTimes, FaEnvelope, FaLock } from "react-icons/fa";
import "./Login.css";
import axios from 'axios';

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', form);
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userId', res.data.userId); // ✅ Save userId
    navigate('/upload');
  } catch (err) {
    console.error('Login error:', err);
    alert("Login failed: " + err.response?.data?.error || 'Server error');
  }
};



  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">
          Don't have an account yet? <a href="/register">Sign up</a>
        </p>
        <div className="input-group">
          <FaEnvelope className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="email address"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="username"
          />
        </div>
        <div className="input-group">
  <FaLock className="input-icon" />
  <input
    type="text"
    name="password"
    placeholder="Password"
    value={form.password}
    onChange={handleChange}
    required
    autoComplete="current-password"
  />
</div>

<p
  className="login-subtitle"
  style={{ marginTop: "0.5rem", textAlign: "left", width: "100%" }}
>
  <a href="/forgot-password">Forgot Password?</a>
</p>

       

        <button type="submit" className="login-btn">
          Login
        </button>
        
        
      </form>
    </div>
  );
}

export default Login;
