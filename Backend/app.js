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
const planRoutes = require('./routes/planRoutes'); // ✅ ADD THIS


const websiteBookingRoutes = require('./routes/websiteBookingRoutes');
const chatRoutes = require('./routes/chatRoutes');


const app = express();


// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));


// CORS configuration
const corsOptions = {
  origin: [
    'https://web-gallery-tan.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
};


app.use(cors(corsOptions));


// Handle preflight requests
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});


// Body parsing middleware
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
    type: 'B2B Platform',
    status: 'Server is healthy and operational',
    endpoints: {
      auth: '/api/auth - User authentication',
      templates: '/api/templates - Browse templates', 
      templateBooking: '/api/template-booking - Book templates with meetings',
      meetings: '/api/meetings - Meeting management',
      admin: '/api/admin - Admin dashboard',
      tutorials: '/api/tutorials - Tutorial tracking',
      plans: '/api/plans - Credit plans & purchases', // ✅ ADD THIS
      health: '/health - Health check'
    },
    documentation: 'Visit /api for detailed API documentation',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + ' seconds'
  });
});


// API documentation route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📖 3Digree B2B API Documentation',
    version: '2.0.0',
    platformType: 'B2B - Business to Business',
    baseUrl: req.protocol + '://' + req.get('host'),
    endpoints: [
      {
        group: 'Authentication',
        path: '/api/auth',
        routes: [
          'POST /api/auth/register - User registration',
          'POST /api/auth/login - User login', 
          'POST /api/auth/google-login - Google OAuth login',
          'POST /api/auth/logout - User logout',
          'GET /api/auth/profile - Get user profile',
          'PUT /api/auth/profile - Update user profile',
          'POST /api/auth/forgot-password - Request password reset',
          'POST /api/auth/reset-password - Reset password with OTP'
        ]
      },
      {
        group: 'Templates',
        path: '/api/templates',
        routes: [
          'GET /api/templates - Get all templates (browse)',
          'GET /api/templates/:id - Get template details',
          'POST /api/templates - Create template (Admin only)',
          'PUT /api/templates/:id - Update template (Admin only)',
          'DELETE /api/templates/:id - Delete template (Admin only)',
          'PATCH /api/templates/:id/status - Toggle template status (Admin)'
        ]
      },
      {
        group: 'Template Booking (B2B Core)',
        path: '/api/template-booking',
        routes: [
          'GET /api/template-booking/dashboard-stats - User booking statistics',
          'GET /api/template-booking/available-slots?date=YYYY-MM-DD - Check available meeting slots',
          'POST /api/template-booking/book/:templateId - Book template with meeting',
          'GET /api/template-booking/my-bookings - Get user bookings',
          'GET /api/template-booking/my-bookings/:bookingId - Get booking details',
          'POST /api/template-booking/:bookingId/communication - Add message to booking',
          'POST /api/template-booking/:bookingId/payment/create - Create payment order',
          'POST /api/template-booking/:bookingId/payment/verify - Verify payment',
          'GET /api/template-booking/:bookingId/payment/history - Get payment history',
          'GET /api/template-booking/admin/all - Get all bookings (Admin)',
          'PUT /api/template-booking/admin/:bookingId/payment-percentage - Set payment percentage (Admin)',
          'PUT /api/template-booking/admin/:bookingId/meeting-status - Update meeting status (Admin)',
          'PUT /api/template-booking/admin/:bookingId/development-progress - Update progress (Admin)',
          'PUT /api/template-booking/admin/:bookingId/final-website - Set final website URL (Admin)'
        ]
      },
      {
        group: 'Meetings',
        path: '/api/meetings',
        routes: [
          'POST /api/meetings/request - Request standalone meeting',
          'GET /api/meetings/my-meetings - Get user meetings',
          'GET /api/meetings/requests - Get meeting requests (Admin)',
          'GET /api/meetings - Get all meetings (Admin)',
          'PUT /api/meetings/:id/schedule - Schedule meeting (Admin)',
          'PUT /api/meetings/:id/status - Update meeting status (Admin)'
        ]
      },
      {
        group: 'Admin',
        path: '/api/admin',
        routes: [
          'GET /api/admin/dashboard - Admin dashboard stats',
          'GET /api/admin/users - Get all users',
          'GET /api/admin/users/:id - Get user details',
          'POST /api/admin/secondary - Create secondary admin',
          'PUT /api/admin/users/:id/status - Update user status',
          'DELETE /api/admin/users/:id - Delete user'
        ]
      },
      {
        group: 'Tutorials',
        path: '/api/tutorials',
        routes: [
          'POST /api/tutorials/interaction - Record tutorial interaction',
          'GET /api/tutorials/analytics - Get tutorial analytics (Admin)'
        ]
      },
      { // ✅ ADD THIS
        group: 'Plans & Credits',
        path: '/api/plans',
        routes: [
          'GET /api/plans/health - Health check',
          'POST /api/plans/create-order - Create Razorpay order',
          'POST /api/plans/verify-payment - Verify payment & add credits'
        ]
      }
    ],
    B2B_Booking_Flow: {
      title: '📋 B2B Template Booking Process',
      steps: [
        '1. User browses templates (no direct purchase)',
        '2. User clicks "Book Free Meeting" → Schedules consultation',
        '3. Admin completes meeting → Sets payment percentage',
        '4. User pays partial amount → Development starts',
        '5. Admin updates progress → Website preview ready',
        '6. User pays final amount → Final website delivered',
        '7. Admin marks complete → Website handed over'
      ],
      payment_structure: 'Admin-controlled partial + final payments',
      removed_B2C_features: [
        '❌ Direct template purchase (/api/orders)',
        '❌ Auto project creation (/api/projects)',
        '❌ Instant payment without consultation'
      ]
    },
    timestamp: new Date().toISOString()
  });
});


// Health check route 
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '💚 3Digree B2B Platform Health Check',
    status: 'healthy',
    platformType: 'B2B',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version,
    features: {
      templateBooking: 'enabled',
      meetingScheduling: 'enabled',
      paymentProgress: 'enabled',
      adminControls: 'enabled',
      razorpayIntegration: 'enabled',
      tutorialTracking: 'enabled',
      creditPlans: 'enabled' // ✅ ADD THIS
    }
  });
});


// ✅ B2B API ROUTES ONLY
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/template-booking', templateBookingRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/plans', planRoutes); // ✅ ADD THIS LINE


app.use('/api/website-booking', websiteBookingRoutes);
app.use('/api/chat', chatRoutes);

// ❌ REMOVED B2C ROUTES:
// app.use('/api/orders', orderRoutes); // Direct purchase - NOT NEEDED
// app.use('/api/projects', projectRoutes); // Auto projects - NOT NEEDED


// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);


module.exports = app;
