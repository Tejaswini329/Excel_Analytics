require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');


// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Atlas connected directly!'))
.catch(err => console.error('Connection error:', err));


// Middleware, Routes, etc...
app.use(express.json());

// Sirf frontend origin allow karna hai (secure tarika)
app.use(cors({
  origin: 'http://localhost:5173', // Vite ka default port
  credentials: true
}));

// Ya development ke liye sab origin allow karna hai toh (simple tarika)
app.use(cors());


// Routes (Yeh wala step)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes); // /api/dashboard



// Example route
app.get('/', (req, res) => {
  res.send('Direct connection works!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
