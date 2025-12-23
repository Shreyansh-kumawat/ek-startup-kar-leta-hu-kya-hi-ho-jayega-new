const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
// 🔥 FIXED: Import authMiddleware
const { verifyToken } = require('./middleware/authMiddleware');

// Import routes
const authRoutes = require('./routes/authRoutes');
const templateRoutes = require('./routes/templateRoutes');
const orderRoutes = require('./routes/orderRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const projectRoutes = require('./routes/projectRoutes');
const adminRoutes = require('./routes/adminRoutes');
const templateBookingController = require('./controllers/templateBookingController');
// 🔥 NEW: Template Booking Routes
const templateBookingRoutes = require('./routes/templateBookingRoutes');

const tutorialRoutes = require('./routes/tutorialRoutes');


const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enhanced CORS configuration
// app.js - CORS section update
const corsOptions = {
  origin: [
    'https://3digree.in', // ✅ Your exact Vercel URL
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
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


// FIXED: Handle preflight requests manually
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin,Cache-Control,X-File-Name');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

// Debug middleware (optional)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    // console.log(`🌐 ${req.method} ${req.path} from origin: ${req.headers.origin || 'no-origin'}`);
    next();
  });
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ROOT ROUTE
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 3Digree-TBS Backend API is running successfully!',
    version: '1.0.0',
    status: 'Server is healthy and operational',
    endpoints: {
      auth: '/api/auth - Authentication routes',
      templates: '/api/templates - Template management', 
      orders: '/api/orders - Order and payments',
      meetings: '/api/meetings - Meeting requests',
      projects: '/api/projects - Project tracking',
      admin: '/api/admin - Admin dashboard',
      // 🔥 NEW ENDPOINT
      templateBooking: '/api/template-booking - Template booking system',
      health: '/health - Health check'
    },
    documentation: 'Visit /api for detailed API documentation',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() + ' seconds'
  });
});

// 🔥 FIXED: Template Booking Dashboard Route with correct authMiddleware
app.get('/api/template-booking/dashboard-stats', verifyToken, templateBookingController.getDashboardStats);

// API documentation route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: '📖 3Digree-TBS API Documentation',
    version: '1.0.0',
    baseUrl: req.protocol + '://' + req.get('host'),
    endpoints: [
      {
        group: 'Authentication',
        path: '/api/auth',
        routes: [
          'POST /api/auth/register - User registration',
          'POST /api/auth/login - User login', 
          'POST /api/auth/logout - User logout',
          'GET /api/auth/profile - Get user profile',
          'POST /api/auth/forgot-password - Request password reset',
          'POST /api/auth/reset-password - Reset password'
        ]
      },
      {
        group: 'Templates',
        path: '/api/templates',
        routes: [
          'GET /api/templates - Get all templates',
          'GET /api/templates/:id - Get template by ID',
          'POST /api/templates - Create template (Admin)',
          'PUT /api/templates/:id - Update template (Admin)',
          'DELETE /api/templates/:id - Delete template (Admin)',
          'PATCH /api/templates/:id/status - Toggle template status (Admin)'
        ]
      },
      // 🔥 NEW: Template Booking Documentation
      {
        group: 'Template Booking',
        path: '/api/template-booking',
        routes: [
          'GET /api/template-booking/dashboard-stats - Get dashboard stats (User)',
          'GET /api/template-booking/available-slots?date=YYYY-MM-DD - Check available meeting slots',
          'POST /api/template-booking/book/:templateId - Book template with meeting',
          'GET /api/template-booking/my-bookings - Get user bookings',
          'GET /api/template-booking/my-bookings/:bookingId - Get booking details',
          'POST /api/template-booking/:bookingId/communication - Add message to booking',
          // 🔥 NEW: Payment Routes Documentation
          'POST /api/template-booking/:bookingId/payment/create - Create payment order',
          'POST /api/template-booking/:bookingId/payment/verify - Verify payment',
          'GET /api/template-booking/:bookingId/payment/history - Get payment history',
          'GET /api/template-booking/admin/all - Get all bookings (Admin)',
          'PUT /api/template-booking/admin/:bookingId/payment-percentage - Set payment percentage (Admin)',
          'PUT /api/template-booking/admin/:bookingId/meeting-status - Update meeting status (Admin)',
          'PUT /api/template-booking/admin/:bookingId/development-progress - Update development progress (Admin)',
          'PUT /api/template-booking/admin/:bookingId/final-website - Set final website URL (Admin)'
        ]
      },
      {
        group: 'Orders',
        path: '/api/orders',
        routes: [
          'POST /api/orders/create - Create new order',
          'POST /api/orders/verify - Verify payment',
          'GET /api/orders/my-orders - Get user orders',
          'GET /api/orders - Get all orders (Admin)',
          'GET /api/orders/:id - Get order details',
          'PUT /api/orders/:id/status - Update order status (Admin)'
        ]
      },
      {
        group: 'Meetings',
        path: '/api/meetings',
        routes: [
          'POST /api/meetings/request - Request meeting',
          'GET /api/meetings/my-meetings - Get user meetings',
          'GET /api/meetings/requests - Get meeting requests (Admin)',
          'GET /api/meetings - Get all meetings (Admin)',
          'PUT /api/meetings/:id/schedule - Schedule meeting (Admin)',
          'PUT /api/meetings/:id/status - Update meeting status (Admin)'
        ]
      },

      {
        group: 'Projects',
        path: '/api/projects',
        routes: [
          'GET /api/projects/my-projects - Get user projects',
          'GET /api/projects - Get all projects (Admin)',
          'PUT /api/projects/:id/status - Update project status (Admin)',
          'POST /api/projects/:id/activate - Activate website (Admin)',
          'PUT /api/projects/:id/links - Update project links (Admin)',
          'POST /api/projects/:id/notification - Add notification (Admin)'
        ]
      },
      {
        group: 'Admin',
        path: '/api/admin',
        routes: [
          'GET /api/admin/dashboard - Admin dashboard stats',
          'GET /api/admin/users - Get all users',
          'GET /api/admin/users/:id - Get user details',
          'GET /api/admin/stats - System statistics',
          'POST /api/admin/secondary - Create secondary admin',
          'PUT /api/admin/users/:id/status - Update user status',
          'DELETE /api/admin/users/:id - Delete user'
        ]
      }
    ],
    // 🔥 UPDATED: Template Booking Flow Documentation
    templateBookingFlow: {
      title: '📋 Template Booking Process Flow',
      steps: [
        '1. User selects template → Book Template button',
        '2. User schedules meeting (24h+ advance) → Meeting booked',
        '3. Admin completes meeting → Sets payment percentage',
        '4. User pays partial amount via Razorpay → Development starts',
        '5. Admin updates progress → Website preview ready',
        '6. User pays final amount via Razorpay → Final website released',
        '7. Process completed → Website delivered'
      ],
      statuses: [
        'meeting_scheduled - Meeting booked, waiting for completion',
        'meeting_completed - Meeting done, waiting for payment percentage',
        'partial_payment_pending - Admin set percentage, user can pay',
        'partial_payment_done - Partial payment received, development started',
        'development_in_progress - Website being developed',
        'website_ready - Website ready for review',
        'final_payment_pending - User can pay final amount',
        'completed - All done, website delivered'
      ],
      // 🔥 NEW: Payment Integration Info
      paymentFeatures: [
        '💳 Razorpay Integration - Secure payment processing',
        '🔄 Payment Verification - Automatic signature validation',
        '📊 Payment History - Track all transactions',
        '💰 Partial & Final Payments - Flexible payment structure',
        '🔐 Webhook Support - Real-time payment updates',
        '📱 Mobile-friendly - Responsive payment UI'
      ]
    },
    timestamp: new Date().toISOString()
  });
});

// Health check route 
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '💚 3Digree-TBS API Health Check',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    version: process.version,
    // 🔥 UPDATED: Template Booking Health Info
    features: {
      templateBooking: 'enabled',
      meetingScheduling: 'enabled',
      paymentProgress: 'enabled',
      adminControls: 'enabled',
      razorpayIntegration: 'enabled',
      paymentVerification: 'enabled'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/admin', adminRoutes);
// 🔥 NEW: Template Booking Routes (WITH PAYMENT ENDPOINTS)
app.use('/api/template-booking', templateBookingRoutes);
app.use('/api/tutorials', tutorialRoutes);

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
