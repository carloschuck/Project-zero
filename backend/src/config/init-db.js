const pool = require('./database');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

async function initializeDatabase() {
  try {
    console.log('🗄️  Starting database initialization...');

    // Read and execute the schema
    const schemaPath = path.join(__dirname, '../migrations/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    await pool.query(schema);
    console.log('✅ Database schema created');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO NOTHING`,
      ['admin@company.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    
    console.log('✅ Default admin user created');
    console.log('');
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('📋 Default credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    
    // If tables already exist, that's okay
    if (error.code === '42P07') {
      console.log('ℹ️  Tables already exist, skipping creation');
      process.exit(0);
    } else {
      console.error('Error details:', error.message);
      process.exit(1);
    }
  }
}

// Run initialization
initializeDatabase();

