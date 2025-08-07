import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './Login.css';

function ResetPassword() {
  const { token } = useParams(); // gets the reset token from the URL
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return alert("Please enter a new password.");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      alert(res.data.message || "Password reset successful!");
      navigate('/login'); // optional: redirect to login page
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Something went wrong";
      alert(errorMsg);
      setError(errorMsg);
    }
  };

  return (
    <div className="login-bg">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2 className="login-title">Reset Password</h2>
        <p className="login-subtitle">Enter a new password below.</p>

        {message && <div className="success-text">{message}</div>}
        {error && <div className="error-text">{error}</div>}

        <div className="input-group">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">Reset Password</button>
      </form>
    </div>
  );
}

export default ResetPassword;
