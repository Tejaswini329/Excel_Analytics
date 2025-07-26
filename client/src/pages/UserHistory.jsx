import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SERVER_BASE_URL = 'http://localhost:5000';

const UserHistory = () => {
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const res = await axios.get(`${SERVER_BASE_URL}/api/downloads`);
        setDownloads(res.data);
      } catch (err) {
        console.error('Failed to fetch downloads:', err);
      }
    };

    fetchDownloads();
  }, []);

  // Group PNG + PDF by file prefix (ID part before dash)
  const grouped = downloads.reduce((acc, file) => {
    const prefix = file.fileName.split('-')[0];
    if (!acc[prefix]) acc[prefix] = { png: null, pdf: null, uploadedAt: file.uploadedAt };
    acc[prefix][file.type] = file;
    return acc;
  }, {});

  const entries = Object.entries(grouped);

  return (
    <div className="history-container">
      <h2>📂 Downloads from Server Folder</h2>
      {entries.length === 0 ? (
        <p>No downloaded charts found.</p>
      ) : (
        <table className="history-table">
          <thead>
            <tr>
              <th>Chart ID</th>
              <th>Uploaded On</th>
              <th>Download PNG</th>
              <th>Download PDF</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([chartId, files]) => (
              <tr key={chartId}>
                <td>{chartId}</td>
                <td>{new Date(files.uploadedAt).toLocaleString()}</td>
                <td>
                  {files.png ? (
                    <a
                      href={`${SERVER_BASE_URL}${files.png.url}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button>Download PNG</button>
                    </a>
                  ) : 'N/A'}
                </td>
                <td>
                  {files.pdf ? (
                    <a
                      href={`${SERVER_BASE_URL}${files.pdf.url}`}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button>Download PDF</button>
                    </a>
                  ) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserHistory;
