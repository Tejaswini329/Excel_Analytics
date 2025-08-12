import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import UploadExcel from './pages/UploadExcel';
import ParseExcel from './pages/ParseExcel';
import WelcomePage from './pages/WelcomePage';
import Chart from './pages/chart';
import UserHistory from './pages/UserHistory';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';

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
          <Link to="/upload" className="nav-link">📤 Upload Excel</Link>
          <Link to="/user-history" className="nav-link">📚 View History</Link>
          <button
            className="logout-btn"
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/upload" element={<UploadExcel />} />
        <Route path="/parse" element={<ParseExcel />} />
        <Route path="/chart" element={<Chart />} />
        <Route
          path="/user-history"
          element={<UserHistory userId={localStorage.getItem('userId')} />}
        />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;
