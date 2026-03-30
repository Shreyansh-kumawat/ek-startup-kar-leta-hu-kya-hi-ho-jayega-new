// Backend\app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// ✅ B2B ROUTES ONLY - Cleaned up
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const templateBookingRoutes = require('./routes/templateBookingRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const tutorialRoutes = require('./routes/tutorialRoutes');
const planRoutes = require('./routes/planRoutes');
const websiteBookingRoutes = require('./routes/websiteBookingRoutes');
const chatRoutes = require('./routes/chatRoutes');
const careerRoutes = require('./routes/careerRoutes'); // ✅ NEW

const app = express();

// ✅ UPDATED: Security middleware with Google OAuth support
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));

// ✅ UPDATED: Better CORS configuration with origin function
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://web-gallery-tan.vercel.app',
      'https://3digree1.vercel.app',
      'https://3digree.in',
      'https://webgallery.store',
      'https://www.webgallery.store',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ];
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROOT ROUTE
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 3Digree B2B Template Booking System API',
    version: '2.0.0',
    status: 'Server is healthy and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + ' seconds'
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '💚 3Digree B2B Platform Health Check',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version,
  });
});

// ✅ API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/template-booking', templateBookingRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/website-booking', websiteBookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/careers', careerRoutes); // ✅ NEW

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
