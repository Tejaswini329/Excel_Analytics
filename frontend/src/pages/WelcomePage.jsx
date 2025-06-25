// components/WelcomePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './WelcomePage.css';

const WelcomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <img
  src="https://img.icons8.com/color/96/combo-chart--v1.png"
  alt="Excel Analytics Icon"
  className="welcome-icon"
/>

        <h1 className="welcome-title">Excel Analytics Platform</h1>
        <p className="welcome-subtitle">
          Upload and visualize your Excel data with ease and elegance.
        </p>
        <button className="welcome-btn" onClick={() => navigate('/login')}>
          🚀 Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomePage;
