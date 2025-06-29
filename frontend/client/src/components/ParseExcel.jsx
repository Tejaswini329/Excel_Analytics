import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './ParseExcel.css';

const ParseExcel = () => {
  const location = useLocation();
  const data = location.state?.data;

  // ✅ Log once after render
  useEffect(() => {
    console.log("Parsed Data:", data);
  }, [data]);

  // ✅ Handle empty or invalid data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <div>No data found. Please upload again.</div>;
  }

  return (
    <div className="parse-container">
      <h2>Parsed Excel Data</h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {data[0].map((header, idx) => (
                <th key={idx}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(1).map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParseExcel;
