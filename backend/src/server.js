const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const pool = require('./config/database');
const { initEmailTransporter } = require('./utils/email');

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const userRoutes = require('./routes/users');
const notificationRoutes = require('./routes/notifications');
const categoryRoutes = require('./routes/categories');
const settingsRoutes = require('./routes/settings');
const migrateRoutes = require('./routes/migrate');
const attachmentRoutes = require('./routes/attachments');
const projectRoutes = require('./routes/projects');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Initialize email transporter
initEmailTransporter();

// Rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint working' });
});

// Temporary migration endpoint for projects
app.post('/api/migrate/projects', async (req, res) => {
  try {
    console.log('🗄️  Starting projects migration...');
    
    const fs = require('fs');
    const path = require('path');
    
    // Read and execute the projects migration
    const projectsMigrationPath = path.join(__dirname, 'migrations/add_projects.sql');
    const projectsMigration = fs.readFileSync(projectsMigrationPath, 'utf8');
    
    await pool.query(projectsMigration);
    console.log('✅ Projects tables created');

    res.json({
      success: true,
      message: 'Projects migration completed successfully!',
      tables: ['projects', 'project_tasks', 'project_members', 'project_comments', 'project_history']
    });

  } catch (error) {
    console.error('❌ Projects migration failed:', error);
    
    // If tables already exist, that's okay
    if (error.code === '42P07') {
      res.json({
        success: true,
        message: 'Projects tables already exist',
        note: 'Migration already completed'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// API routes
app.use('/api/migrate', migrateRoutes);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api', attachmentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API: http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  pool.end(() => {
    console.log('Database pool closed');
    process.exit(0);
  });
});


