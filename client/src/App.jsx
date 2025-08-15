// src/App.js
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import UploadExcel from './pages/UploadExcel';
import ParseExcel from './pages/ParseExcel';
import WelcomePage from './pages/WelcomePage';
import Chart from './pages/Chart';
import UserHistory from './pages/UserHistory';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRegister from "./pages/AdminRegister";               // NEW
import AdminForgotPassword from "./pages/AdminForgotPassword"; // NEW
import './App.css';

function App() {
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role'); // 'admin' or 'user'

  // Pages where navbar should be hidden (added admin pages here)
  const hideNavRoutes = [
    "/login",
    "/register",
    "/admin-login",
    "/admin-register",
    "/admin-forgot-password",
  ];
  const hideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div>
      <h1>📊 Excel Analytics Platform</h1>

      {!hideNav && isLoggedIn && role !== 'admin' && (
        <nav className="navbar">
          <Link to="/upload" className="nav-link">📤 Upload Excel</Link>
          <Link to="/user-history" className="nav-link">📚 View History</Link>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('role');
              localStorage.removeItem('userId');
              window.location.href = '/'; // force refresh
            }}
          >
            Logout
          </button>
        </nav>
      )}

      {!hideNav && isLoggedIn && role === 'admin' && (
        <nav className="navbar">
          <Link to="/admin-dashboard" className="nav-link">📊 Admin Dashboard</Link>
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('role');
              localStorage.removeItem('userId');
              window.location.href = '/';
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
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />                {/* NEW */}
        <Route path="/admin-forgot-password" element={<AdminForgotPassword />} /> {/* NEW */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
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
