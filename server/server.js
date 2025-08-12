require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const uploadHistoryRouter = require('./routes/uploadHistory');
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
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes); // Handles routes like /api/dashboard

const uploadExcelRoutes = require('./routes/uploadExcel');
app.use('/api/excel', uploadExcelRoutes); // ✅ POST /api/excel/upload

const chartRoutes = require('./routes/ChartHistory');
app.use('/api/charthistory', chartRoutes); // ✅ POST /api/charthistory/upload

app.use('/api/uploadhistory', uploadHistoryRouter);


 // still OK

const downloadRoutes = require('./routes/downloads');
app.use('/api/downloads', downloadRoutes); // ✅ mount route
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));



// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('🚀 Server is running and MongoDB is connected!');
});
const __dirname1 = path.resolve();

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
