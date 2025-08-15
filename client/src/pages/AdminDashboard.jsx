import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const statsRes = await axios.get('http://localhost:5000/api/admin/stats');
      setStats(statsRes.data);
      const usersRes = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(usersRes.data);
    };
    fetchData();
  }, []);

  const deleteUser = async (id) => {
    await axios.delete(`http://localhost:5000/api/admin/users/${id}`);
    setUsers(users.filter(user => user._id !== id));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-card">
        <p><strong>Total Users:</strong> {stats.totalUsers}</p>
        <p><strong>Total Charts:</strong> {stats.totalCharts}</p>
        <h3>Most Used Chart Types:</h3>
        <ul>
          {stats.chartTypeCounts?.map(c => (
            <li key={c._id}>{c._id}: {c.count}</li>
          ))}
        </ul>
      </div>

      <div className="user-management">
        <h3>User Management</h3>
        <table className="user-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <button className="delete-btn" onClick={() => deleteUser(u._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
