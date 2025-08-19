// src/pages/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import "./AdminDashboard.css";

const COLORS = ["#4B9FE1", "#69C2B0", "#FFD166", "#FF8C94", "#A29BFE", "#A3CEDC"];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState({
    totalCharts: 0,
    totalUsers: 0,
    chartTypes: [],
    dailyUploads: [],
  });
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/analytics");
        const fetched = res.data;

        const formattedUploads = (fetched.dailyUploads || [])
          .map((entry) => ({
            ...entry,
            date: new Date(entry.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            }),
            originalDate: new Date(entry.date),
          }))
          .sort((a, b) => a.originalDate - b.originalDate);

        setAnalytics({
          totalCharts: fetched.totalCharts,
          totalUsers: fetched.totalUsers,
          chartTypes: fetched.chartTypes || [],
          dailyUploads: formattedUploads,
        });
      } catch (err) {
        console.error("Error fetching analytics:", err);
      }
    };
    fetchAnalytics();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Toggle user active/inactive
  const toggleUser = async (userId) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/admin/users/${userId}/toggle`
      );
      const updatedUser = res.data;
      setUsers(users.map((u) => (u._id === updatedUser._id ? updatedUser : u)));
    } catch (err) {
      console.error("Error toggling user:", err);
    }
  };

  // Filtered users for search & status
  const filteredUsers = useMemo(() => {
  return users.filter((u) => {
    const username = u.username || "";
    const email = u.email || "";
    const matchesSearch =
      username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && u.isActive) ||
      (statusFilter === "disabled" && !u.isActive);
    return matchesSearch && matchesStatus;
  });
}, [users, searchTerm, statusFilter]);

  // Top users by uploads (limit 5)
  const topUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => (b.chartCount || 0) - (a.chartCount || 0))
      .slice(0, 5)
      .map((u) => ({ username: u.username, count: u.chartCount || 0 }));
  }, [users]);

  return (
    <div className="overview-container">
      <h2>📊 Admin Dashboard</h2>

      {/* Summary Cards */}
      <div className="overview-cards">
        <div className="card">
          📈 Total Charts: <strong>{analytics.totalCharts}</strong>
        </div>
        <div className="card">
          👥 Total Users: <strong>{analytics.totalUsers}</strong>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* Chart Types */}
        {analytics.chartTypes.length > 0 && (
          <div className="chart-box">
            <h3>📌 Chart Types Used</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={analytics.chartTypes}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {analytics.chartTypes.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Uploads */}
        {analytics.dailyUploads.length > 0 && (
          <div className="chart-box">
            <h3>📅 Daily Uploads</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={analytics.dailyUploads}
                margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4B9FE1"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Users by Uploads */}
        {topUsers.length > 0 && (
          <div className="chart-box">
            <h3>🏆 Top Users by Uploads</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topUsers} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="username" />
                <Tooltip />
                <Bar dataKey="count" fill="#FFD166" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="section">
        <h3>👤 Manage Users</h3>

        {/* Search & Filter */}
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>

        {filteredUsers.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Total Charts</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user._id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.chartCount || 0}</td>
                  <td>{user.isActive ? "✅ Active" : "❌ Disabled"}</td>
                  <td>
                    <button
                      className={user.isActive ? "disable-btn" : "enable-btn"}
                      onClick={() => toggleUser(user._id)}
                    >
                      {user.isActive ? "Disable" : "Enable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users found.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
