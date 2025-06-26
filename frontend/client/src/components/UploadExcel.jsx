// UploadExcel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './UploadExcel.css';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndParse = async () => {
    if (!file) return setMessage('Please select a file first.');

    try {
      const reader = new FileReader();

      reader.onload = (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        navigate('/parse', { state: { data: jsonData } });
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      setMessage('Failed to parse Excel file.');
    }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload and Parse Excel File</h2>
        <div className="upload-input">
          <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
        </div>
        <button className="upload-btn" onClick={handleUploadAndParse}>
          Upload & View
        </button>
        {message && <p className="message" style={{ marginTop: '1rem', color: 'red' }}>{message}</p>}
      </div>
    </div>
  );
};

export default UploadExcel;
