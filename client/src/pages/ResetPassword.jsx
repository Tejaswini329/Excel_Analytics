// ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ import useNavigate
import axios from "axios";
import './ResetPassword.css';
function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate(); // ✅ create navigate instance
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        { password }
      );
      setMessage(res.data.message);
      setError("");

      // ✅ Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Password</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Update Password</button>
    </form>
  );
}

export default ResetPassword;
