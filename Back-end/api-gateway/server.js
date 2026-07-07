const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Resolve target URLs from environment variables
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const RIDE_SERVICE_URL = process.env.RIDE_SERVICE_URL || 'http://localhost:5003';
const MARKETPLACE_SERVICE_URL = process.env.MARKETPLACE_SERVICE_URL || 'http://localhost:5000';

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[API-GATEWAY] ${req.method} ${req.path} -> forwarding...`);
  next();
});

// Explicit proxy mappings
// 1. Auth Service Routes
app.use('/api/auth', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));
app.use('/api/user/me', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));
app.use('/api/user/by-email', createProxyMiddleware({ target: AUTH_SERVICE_URL, changeOrigin: true }));

// 2. Ride Service Routes
app.use('/api/user/requests', createProxyMiddleware({ target: RIDE_SERVICE_URL, changeOrigin: true }));
app.use('/api/user/accepted', createProxyMiddleware({ target: RIDE_SERVICE_URL, changeOrigin: true }));
app.use('/api/rides', createProxyMiddleware({ target: RIDE_SERVICE_URL, changeOrigin: true }));
app.use('/api/chats', createProxyMiddleware({ target: RIDE_SERVICE_URL, changeOrigin: true }));

// 3. Marketplace Service Routes
app.use('/api/user/profile', createProxyMiddleware({ target: MARKETPLACE_SERVICE_URL, changeOrigin: true }));
app.use('/api/user/history', createProxyMiddleware({ target: MARKETPLACE_SERVICE_URL, changeOrigin: true }));
app.use('/api/listings', createProxyMiddleware({ target: MARKETPLACE_SERVICE_URL, changeOrigin: true }));
app.use('/api/marketplace', createProxyMiddleware({ target: MARKETPLACE_SERVICE_URL, changeOrigin: true }));

// 4. WebSocket Proxy (Socket.io support for real-time chats)
app.use('/socket.io', createProxyMiddleware({
  target: RIDE_SERVICE_URL,
  ws: true,
  changeOrigin: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API Gateway is healthy' });
});

app.listen(PORT, () => {
  console.log(`[API-GATEWAY] Running on port ${PORT}`);
  console.log(`[API-GATEWAY] Routing /api/auth and /api/user/me -> ${AUTH_SERVICE_URL}`);
  console.log(`[API-GATEWAY] Routing /api/rides and /socket.io -> ${RIDE_SERVICE_URL}`);
  console.log(`[API-GATEWAY] Routing /api/listings -> ${MARKETPLACE_SERVICE_URL}`);
});
