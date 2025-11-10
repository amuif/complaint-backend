const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');  
require('dotenv').config();

// Import database service
const { initDb } = require('./services/databaseService');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Create Express application
const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })
);

// Performance middleware
app.use(compression());

// CORS configuration
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Range', 'Authorization'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length'],
  })
);
// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging (only in development)
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const UPLOADS_PATH = path.join(__dirname, 'Uploads');
const VOICE_COMPLAINTS_PATH = path.join(UPLOADS_PATH, 'voice_complaints');
try {
  fs.mkdirSync(VOICE_COMPLAINTS_PATH, { recursive: true });
  console.log(`Upload dir ensured: ${VOICE_COMPLAINTS_PATH}`);
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log(`Upload dir already exists: ${VOICE_COMPLAINTS_PATH}`);
  } else {
    console.error(`Warning: Could not ensure upload dir (${err.message}). Continuing startup...`);
  }
}
// Static files
app.use(
  '/Uploads',
  express.static(UPLOADS_PATH, {
    setHeaders: (res, filePath) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Accept-Ranges', 'bytes');
      if (filePath.endsWith('.webm')) {
        res.setHeader('Content-Type', 'audio/webm');
      }
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  })
);// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🏢 Office Management System API',
    status: '✅ Successfully deployed',
    version: '2.0.0',
    environment: NODE_ENV,
    features: [
      'Citizen Complaint System',
      'Service Rating Platform',
      'Feedback Management',
      'Staff Directory',
      'Admin Dashboard',
    ],
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: '✅ Healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    environment: NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (NODE_ENV === 'development') {
    console.error('Error:', err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    message: NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    available_endpoints: {
      public: '/api/',
      admin: '/api/admin/',
      health: '/health',
      docs: '/api/health',
    },
  });
});

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database
    await initDb();

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT} with ${NODE_ENV} environment`);
    });
  } catch (error) {
    if (NODE_ENV === 'development') {
      console.error('Failed to start server:', error);
    }
    process.exit(1);
  }
}

// Graceful shutdown handlers
const shutdown = (signal) => {
  if (NODE_ENV === 'development') {
    console.log(`Received ${signal}. Graceful shutdown...`);
  }
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  if (NODE_ENV === 'development') {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  }
  process.exit(1);
});

// Start the application
startServer();
