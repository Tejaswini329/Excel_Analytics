import React, { useState } from "react";
import { FaApple, FaGoogle, FaTimes, FaEnvelope, FaLock } from "react-icons/fa";
import "./Login.css";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    alert("Login clicked!");
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-logo">
          <img src="https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg" alt="logo" />
        </div>
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
            type= "text" 
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
          {/* <span
            className="toggle-password"
            onClick={() => setShowPassword((v) => !v)}
            title={showPassword ? "Hide Password" : "Show Password"}
          >
            {showPassword ? "🙈" : "👁️"}
          </span> */}
        </div>
        <button type="submit" className="login-btn">
          Login
        </button>
        <div className="divider"><span>OR</span></div>
        <div className="social-row">
          <button type="button" className="social-btn apple"><FaApple size={20} /></button>
          <button type="button" className="social-btn google"><FaGoogle size={20} /></button>
          <button type="button" className="social-btn x"><FaTimes size={20} /></button>
        </div>
      </form>
    </div>
  );
}

export default Login;
