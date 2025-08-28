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

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button className="welcome-btn" onClick={() => navigate('/login')}>
            🚀 Get Started (User)
          </button>

          <button
            className="welcome-btn"
            style={{ backgroundColor: '#444', color: '#fff' }}
            onClick={() => navigate('/admin-login')}
          >
            🛡️ Admin Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
