const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('ondigitalocean.com') ? { rejectUnauthorized: false } : false,
});

async function resetPassword() {
  try {
    const email = 'carloschuck@me.com';
    const newPassword = 'NewPassword123!';
    const hashedPassword = '$2b$10$daGxMA91ywA1KSI/npAItucUSyy.20MbkLaiEkhw/170N4gVLFnnO';
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log('❌ User not found:', email);
      console.log('Available users:');
      const allUsers = await pool.query('SELECT email FROM users');
      allUsers.rows.forEach(user => console.log('-', user.email));
      return;
    }
    
    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );
    
    console.log('✅ Password reset successfully!');
    console.log('Email:', email);
    console.log('New Password:', newPassword);
    console.log('');
    console.log('You can now log in with these credentials.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();
