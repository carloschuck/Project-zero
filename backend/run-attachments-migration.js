// Run this script to update the attachments table for project support
// Usage: node run-attachments-migration.js

const fs = require('fs');
const path = require('path');
const pool = require('./src/config/database');

async function runMigration() {
  console.log('🔧 Starting attachments table migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src/migrations/update_attachments_for_projects.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded');
    console.log('🗄️  Connecting to database...');
    
    // Run the migration
    await pool.query(migrationSQL);
    
    console.log('\n✅ Migration completed successfully!');
    console.log('\n📊 Attachments table now supports:');
    console.log('   ✓ filename column');
    console.log('   ✓ original_filename column');
    console.log('   ✓ project_id column (for project attachments)');
    console.log('   ✓ entity_type column (ticket or project)');
    console.log('   ✓ ticket_id is now optional');
    console.log('\n🎉 You can now upload files to both tickets and projects!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the migration
runMigration();

