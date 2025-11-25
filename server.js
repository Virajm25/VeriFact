require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./src/routes/apiRoutes');

// 1. Import the DB logic
const connectDB = require('./src/config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// 2. Connect to Database
connectDB();

// Middleware
// ALLOW REACT TO TALK TO NODE
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', apiRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 VeriFact Backend running at http://localhost:${PORT}`);
});