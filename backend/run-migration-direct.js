// Direct migration script with proper SSL handling
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

// Read command line arguments for database credentials
const args = process.argv.slice(2);
if (args.length < 5) {
  console.log('Usage: node run-migration-direct.js <host> <port> <database> <user> <password>');
  process.exit(1);
}

const [host, port, database, user, password] = args;

// Create pool with SSL enabled for DigitalOcean
const pool = new Pool({
  host,
  port: parseInt(port),
  database,
  user,
  password,
  ssl: {
    rejectUnauthorized: false // Required for DigitalOcean managed databases
  }
});

async function initializeDatabase() {
  try {
    console.log('🗄️  Starting database initialization...');
    console.log(`📍 Connecting to: ${host}:${port}/${database}`);

    // Test connection
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');

    // Read and execute the schema
    const schemaPath = path.join(__dirname, 'src/migrations/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    await pool.query(schema);
    console.log('✅ Database schema created');

    // Create default admin user
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['admin@company.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Default admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('');
    console.log('🎉 Database initialization complete!');
    console.log('');
    console.log('📋 Default credentials:');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the default password after first login!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    
    // If tables already exist, that's okay
    if (error.code === '42P07') {
      console.log('ℹ️  Tables already exist');
      await pool.end();
      process.exit(0);
    } else {
      console.error('Error code:', error.code);
      await pool.end();
      process.exit(1);
    }
  }
}

// Run initialization
initializeDatabase();

