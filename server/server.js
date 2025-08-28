require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const uploadHistoryRouter = require('./routes/uploadHistory');

// =========================
// MongoDB Connection
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas connected!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// =========================
// Middleware
// =========================
/*app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));*/
app.use(express.json({ limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));

// =========================
// Routes
// =========================
console.log("Loading auth routes...");
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

console.log("Loading protected routes...");
const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes);

console.log("Loading excel routes...");
const uploadExcelRoutes = require('./routes/uploadExcel');
app.use('/api/excel', uploadExcelRoutes);

console.log("Loading chart routes...");
const chartRoutes = require('./routes/ChartHistory');
app.use('/api/charthistory', chartRoutes);

console.log("Loading upload history routes...");
app.use('/api/uploadhistory', uploadHistoryRouter);

console.log("Loading admin routes...");
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

console.log("Loading download routes...");
const downloadRoutes = require('./routes/downloads');
app.use('/api/downloads', downloadRoutes);
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));

// Health check
app.get('/', (req, res) => {
  res.send('🚀 Server is running and MongoDB is connected!');
});

// =========================
// Serve frontend in production
// =========================
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname1, "client", "dist", "index.html"));
  });
}

// =========================
// Start server (Render-friendly)
// =========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
