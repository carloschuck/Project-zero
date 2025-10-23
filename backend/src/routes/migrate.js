const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

// One-time migration endpoint
// Call this once to initialize the database
router.post('/run', async (req, res) => {
  try {
    console.log('🗄️  Starting database migration...');

    // Read and execute the schema
    const schemaPath = path.join(__dirname, '../config/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('✅ Database schema created');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@company.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    console.log('✅ Default admin user created');

    res.json({
      success: true,
      message: 'Database migrations completed successfully!',
      defaultCredentials: {
        email: 'admin@company.com',
        password: 'admin123',
        warning: 'CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN'
      }
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    // If tables already exist, that's okay
    if (error.code === '42P07') {
      res.json({
        success: true,
        message: 'Database already initialized',
        note: 'Tables already exist'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
});

// Projects migration endpoint
// Call this to add the projects feature tables
router.post('/projects', async (req, res) => {
  try {
    console.log('🗄️  Starting projects migration...');

    // Read and execute the projects migration
    const projectsMigrationPath = path.join(__dirname, '../migrations/add_projects.sql');
    const projectsMigration = await fs.readFile(projectsMigrationPath, 'utf8');
    
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

module.exports = router;

