const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

const mongoose = require('mongoose');

const userRoutes = require('./src/router/user.router.js');
const productRoute = require('./src/router/product.router.js');
const loginRoute = require('./src/router/login.router.js');
const ticketRoute = require('./src/router/tickets.router.js');
const passwordRoute = require('./src/router/password.router.js');

// HTTP server
const server = http.createServer(app);

// WebSocket setup
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });
global.wss = wss;

wss.on('connection', (ws) => {
  console.log('✅ WebSocket client connected');

  // Send a welcome message
  ws.send(JSON.stringify({ message: 'Welcome! WebSocket connection established.' }));

  // Listen for messages from client
  ws.on('message', (message) => {
    console.log('📩 Received:', message.toString());

  // Example: Echo reply
  ws.send(JSON.stringify({ reply: `Server received: ${message}` }));
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });

  ws.on('error', (error) => {
    console.error('⚠️ WebSocket error:', error);
  });
});

// Middleware
app.use(cors({
  origin: [
    "https://support-demo.inventionminds.com",
    "http://localhost:4300",
    "http://localhost:4200",
    "http://13.201.226.150"
  ],
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoute);
app.use('/api/v1', loginRoute);
app.use('/api/v1', ticketRoute);
app.use('/api/v1', passwordRoute);

// Root endpoint
app.get('/', (req, res) => {
  res.send('✅ Server is running.');
});

// MongoDB connection
mongoose.connect(process.env.DB_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
