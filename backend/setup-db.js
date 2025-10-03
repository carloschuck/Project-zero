// Simple setup script that runs with app's database permissions
const pool = require('./src/config/database');
const bcrypt = require('bcrypt');
const fs = require('fs').promises;
const path = require('path');

async function setup() {
  const client = await pool.connect();
  
  try {
    console.log('🗄️  Setting up database...');
    
    // Read schema
    const schemaPath = path.join(__dirname, 'src/migrations/schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Split by semicolon and execute each statement separately
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📋 Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      try {
        await client.query(statements[i]);
        console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      } catch (err) {
        if (err.code === '42P07') {
          console.log(`ℹ️  Statement ${i + 1}: Object already exists, skipping`);
        } else if (err.code === '42501') {
          console.log(`⚠️  Statement ${i + 1}: Permission denied (may need extension), skipping`);
        } else {
          console.log(`❌ Statement ${i + 1} failed: ${err.message}`);
        }
      }
    }
    
    // Create admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await client.query(
      `INSERT INTO users (email, password, first_name, last_name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      ['carloschuck@me.com', hashedPassword, 'Admin', 'User', 'admin']
    );
    
    if (result.rowCount > 0) {
      console.log('✅ Admin user created!');
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    console.log('');
    console.log('🎉 Setup complete!');
    console.log('');
    console.log('Login with:');
    console.log('  Email: carloschuck@me.com');
    console.log('  Password: admin123');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

setup().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
