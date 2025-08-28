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
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));


app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// ✅ Routes
console.log("Loading auth routes...");
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

console.log("Loading protect routes...");
const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes); // Handles routes like /api/dashboard

console.log("Loading excel routes...");
const uploadExcelRoutes = require('./routes/uploadExcel');
app.use('/api/excel', uploadExcelRoutes); // ✅ POST /api/excel/upload

console.log("Loading chart..");
const chartRoutes = require('./routes/ChartHistory');
app.use('/api/charthistory', chartRoutes); // ✅ POST /api/charthistory/upload

console.log("Loading upload routes...");
app.use('/api/uploadhistory', uploadHistoryRouter);

// ❌ Old ESM import
// import adminRoutes from "./routes/admin.js";

// ✅ Fix: use require
console.log("Loading admin routes...");
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

console.log("Loading download routes...");
const downloadRoutes = require('./routes/downloads');
app.use('/api/downloads', downloadRoutes); // ✅ mount route
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// ✅ Health Check Route
console.log("Loading all routes...");
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
