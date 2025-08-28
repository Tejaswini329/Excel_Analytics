import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ParseExcel.css';

const ParseExcel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const rawData = location.state?.data || [];

  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xIndex, setXIndex] = useState(null);
  const [yIndex, setYIndex] = useState(null);
  const [labelIndex, setLabelIndex] = useState(null);
  const [chartType, setChartType] = useState('bar');
  const fileName = location.state?.fileName || 'unknown_file.xlsx';

  useEffect(() => {
    if (Array.isArray(rawData) && rawData.length > 0) {
      const cleanedData = rawData.filter(row => Array.isArray(row));
      setData(cleanedData);
      setHeaders(cleanedData[0] || []);
    }
  }, [rawData]);

  const handleGenerateChart = () => {
    if (xIndex !== null && yIndex !== null) {
      navigate('/chart', {
        state: {
          data,
          xIndex,
          yIndex,
          labelIndex,
          chartType,
          fileName
        }
      });
    } else {
      alert('Please select both X and Y axes.');
    }
  };

  return (
    <div className="parsed-table-container">
      <h2 className="parsed-heading">Parsed Excel Data</h2>

      {/* Dropdowns for axis and chart type */}
      <div className="selection-container">
        <div className="selection-group">
          <label>
            X-axis:
            <select value={xIndex ?? ''} onChange={(e) => setXIndex(Number(e.target.value))}>
              <option value="">Select Column</option>
              {headers.map((header, i) => (
                <option key={i} value={i}>{header}</option>
              ))}
            </select>
          </label>

          <label>
            Y-axis:
            <select value={yIndex ?? ''} onChange={(e) => setYIndex(Number(e.target.value))}>
              <option value="">Select Column</option>
              {headers.map((header, i) => (
                <option key={i} value={i}>{header}</option>
              ))}
            </select>
          </label>

          <label>
            Label Column (X-axis names):
            <select value={labelIndex ?? ''} onChange={(e) => setLabelIndex(Number(e.target.value))}>
              <option value="">Select Column</option>
              {headers.map((header, i) => (
                <option key={i} value={i}>{header}</option>
              ))}
            </select>
          </label>

          <label>
            Chart Type:
            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="bar">Bar (2D)</option>
              <option value="line">Line (2D)</option>
              <option value="pie">Pie (2D)</option>
              <option value="scatter">Scatter (2D)</option>
              <option value="3d-bar">Bar (3D)</option>
            </select>
          </label>

          <button onClick={handleGenerateChart}>Generate Chart</button>
        </div>
      </div>

      {/* Display parsed data */}
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
