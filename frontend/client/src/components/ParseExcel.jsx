// ParseExcel.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './ParseExcel.css';

const ParseExcel = () => {
  const location = useLocation();
  const data = location.state?.data || [];

  return (
    <div className="parsed-table-container">
      <h2 className="parsed-heading">Parsed Excel Data</h2>
      <div className="parsed-table-wrapper">
        <table className="parsed-table">
          <tbody>
            {data.length === 0 ? (
              <tr><td>No data to display.</td></tr>
            ) : (
              data.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParseExcel;
