import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UserHistory.css';

const UserHistory = ({ userId: propUserId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = propUserId || localStorage.getItem('userId');

 useEffect(() => {
  if (!userId) return;

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/charthistory/${userId}`);
      if (Array.isArray(res.data)) {
        // Remove incomplete entries and duplicates
        const filtered = res.data.filter(item =>
          item.fileName &&
          item.chartType &&
          item.downloadLinkPNG &&
          item.downloadLinkPDF
        );

        const unique = Array.from(
          new Map(filtered.map(item => [`${item.fileName}-${item.chartType}`, item])).values()
        );
        setHistory(unique);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  fetchHistory();
}, [userId]);


  if (loading) return <p className="loading-text">⏳ Loading...</p>;
  if (!history.length) return <p className="no-history-text">📭 No chart history available.</p>;

  return (
    <div className="user-history-container">
      <h2 className="user-history-title">📁 History</h2>
      <div className="table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>🗂 File Name</th>
              <th>📊 Chart Type</th>
              <th>🖼️ PNG</th>
              <th>📄 PDF</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.fileName}</td>
                <td>{item.chartType || 'Unknown'}</td>
                <td>
                  {item.downloadLinkPNG ? (
                    <a
                      className="download-button"
                      href={`http://localhost:5000${item.downloadLinkPNG}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PNG
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {item.downloadLinkPDF ? (
                    <a
                      className="download-button"
                      href={`http://localhost:5000${item.downloadLinkPDF}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Download PDF
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserHistory;
