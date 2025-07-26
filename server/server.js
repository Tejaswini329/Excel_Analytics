require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes); // Handles routes like /api/dashboard

const uploadExcelRoutes = require('./routes/uploadExcel');
app.use('/api/excel', uploadExcelRoutes); // ✅ POST /api/excel/upload

const chartRoutes = require('./routes/ChartHistory');
app.use('/api/charthistory', chartRoutes); // ✅ POST /api/charthistory/upload

app.use('/api/history', require('./routes/userHistory')); 
 // still OK

const downloadRoutes = require('./routes/downloads');
app.use('/api/downloads', downloadRoutes); // ✅ mount route
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));


// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('🚀 Server is running and MongoDB is connected!');
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
