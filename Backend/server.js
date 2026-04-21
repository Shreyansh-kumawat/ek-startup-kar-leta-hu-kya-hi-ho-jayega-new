// Backend\server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables FIRST
dotenv.config();


const { startProgressUpdater } = require('./jobs/progressUpdater');


// Import app AFTER environment variables
const app = require('./app');

// Database connection
const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Remove deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    // console.removed.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // console.removed.log(`📊 Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Handle uncaught exceptions BEFORE anything else
process.on('uncaughtException', (err) => {
  // console.removed.log('🔥 UNCAUGHT EXCEPTION! Shutting down...');
  // console.removed.log('Error Name:', err.name);
  // console.removed.log('Error Message:', err.message);
  // console.removed.log('Stack Trace:', err.stack);
  process.exit(1);
});

// Connect to database
connectDB();

startProgressUpdater();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  // console.removed.log('⚠️ UNHANDLED REJECTION! Shutting down...');
  // console.removed.log('Error Name:', err.name);
  // console.removed.log('Error Message:', err.message);
  // console.removed.log('Stack Trace:', err.stack);
  
  // Close server gracefully
  if (server) {
    server.close(() => {
      // console.removed.log('💀 Process terminated due to unhandled rejection');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  // console.removed.log('  Server Status:');
  // console.removed.log(`   ✅ Running in ${process.env.NODE_ENV || 'development'} mode`);
  // console.removed.log(`   🌐 Port: ${PORT}`);
  // console.removed.log(`   📅 Started at: ${new Date().toLocaleString()}`);
  // console.removed.log(`   🔗 Local URL: http://localhost:${PORT}`);
  
  // Show available endpoints
  if (process.env.NODE_ENV === 'development') {
    // console.removed.log('\n📋 Available endpoints:');
    // console.removed.log('   - Health: http://localhost:' + PORT + '/health');
    // console.removed.log('   - API: http://localhost:' + PORT + '/api');
    // console.removed.log('   - Plans: http://localhost:' + PORT + '/api/plans'); // ✅ NEW
  }
});

// Graceful shutdown handlers
const gracefulShutdown = (signal) => {
  // console.removed.log(`\n${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    // console.removed.log('🔌 HTTP server closed');
    
    try {
      // Close database connection
      await mongoose.connection.close();
      // console.removed.log('📊 Database connection closed');
      // console.removed.log('✅ Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during graceful shutdown:', error);
      process.exit(1);
    }
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    // console.removed.log('⏰ Force shutdown - taking too long');
    process.exit(1);
  }, 10000);
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT')); // Ctrl+C

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
    // console.removed.log('💡 Try a different port or kill the process using this port');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

app.use('/api/orders', (req, res, next) => {
  // console.removed.log('🔍 Orders route hit:', req.method, req.url);
  // console.removed.log('🔍 Request body:', req.body);
  // console.removed.log('🔍 Request user:', req.user);
  next();
});

// ✅ Health check endpoints
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ✅ NEW: Plan system health check
app.get('/api/health/plans', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Plan Purchase System',
    razorpay: process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not Configured',
    timestamp: new Date().toISOString()
  });
});

// Export server for testing purposes
module.exports = server;
