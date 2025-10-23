const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Projects feature migration...\n');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src', 'migrations', 'add_projects.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Run the migration
    await client.query('BEGIN');
    console.log('📝 Executing migration SQL...');
    
    await client.query(migrationSQL);
    
    await client.query('COMMIT');
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 New tables created:');
    console.log('   - projects');
    console.log('   - project_tasks');
    console.log('   - project_members');
    console.log('   - project_comments');
    console.log('   - project_history');
    console.log('\n📝 Tables updated:');
    console.log('   - attachments (now supports projects)');
    console.log('   - notifications (now supports project notifications)');
    console.log('\n🎉 Projects feature is ready to use!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the migration
runMigration();

