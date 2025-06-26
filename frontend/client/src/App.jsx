import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import UploadExcel from './components/UploadExcel';
import ParseExcel from './components/ParseExcel';
import WelcomePage from './components/WelcomePage';
import './App.css';

function App() {
  const location = useLocation();
  const hideNav = location.pathname === "/login" || location.pathname === "/register";
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  return (
    <div>
      <h1>📊 Excel Analytics Platform</h1>

      {!hideNav && isLoggedIn && (
        <nav className="navbar">
          <Link to="/upload">📤 Upload Excel</Link>
          <button
            style={{
              marginLeft: "20px",
              padding: "6px 14px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              window.location.href = '/'; // force refresh
            }}
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<UploadExcel />} />
        <Route path="/parse" element={<ParseExcel />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;