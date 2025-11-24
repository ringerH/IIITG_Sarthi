const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

const corsOptions = {
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://campus_frontend:3000',
      process.env.FRONTEND_URL 
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  
// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => console.error('MongoDB connection error:', err));

// Import routes
const listingRoutes = require('./backend/routes/listingRoutes');
const userRoutes = require('./backend/routes/userRoutes'); 

// Routes
app.use('/api/listings', listingRoutes);
app.use('/api/user', userRoutes); 

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Campus Marketplace API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            listings: '/api/listings',
            user: '/api/user' }})
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: err.message 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API base: http://localhost:${PORT}/api`);
});