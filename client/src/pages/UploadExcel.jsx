// UploadExcel.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import axios from 'axios';
import './UploadExcel.css';

const UploadExcel = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndView = async () => {
    if (!file) return setMessage('Please select a file first.');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });


        // 1. Send to MongoDB via backend
        const userId = localStorage.getItem('userId'); 
if (!userId) {
  setMessage('User ID missing. Please log in first.');
  return;
}

const formData = new FormData();
formData.append('file', file);
formData.append('userId', userId); // just the string



           await axios.post('http://localhost:5000/api/excel/upload', formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
 });




        // 2. Navigate to parse page
      navigate('/parse', { state: { data: jsonData, fileName: file.name } });

      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      setMessage('Error uploading or parsing file.');
    }
  };

  return (
    <div className="upload-page-container">
      <div className="upload-card">
        <h2 className="upload-title">Upload and View Excel File</h2>
        <div className="upload-input">
          <input type="file" accept=".xls,.xlsx" onChange={handleFileChange} />
        </div>
        <button className="upload-btn" onClick={handleUploadAndView}>
          Upload & View
        </button>
        {message && <p style={{ color: 'red', marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
};

export default UploadExcel;
