import React, { useState } from "react";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaGoogle,
  FaApple,
  FaTimes,
} from "react-icons/fa";
import "./Login.css"; // Reusing the same CSS file

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Registration logic here
    alert("Registration successful!");
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

        <div className="input-group">
          <FaUser className="input-icon" />
          <input
            type="Username"
            name="name"
            placeholder="Usename"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
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
            type="text"
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

        <div className="input-group">
          <FaLock className="input-icon" />
          <input
            type="text"
            name="password"
            placeholder="Confirm Password"
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
          Sign Up
        </button>

        <div className="divider">
          <span>OR</span>
        </div>

        <div className="social-row">
          <button type="button" className="social-btn apple">
            <FaApple size={20} />
          </button>
          <button type="button" className="social-btn google">
            <FaGoogle size={20} />
          </button>
          <button type="button" className="social-btn x">
            <FaTimes size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
