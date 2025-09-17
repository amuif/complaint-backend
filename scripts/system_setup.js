/**
 * =====================================
 * OFFICE MANAGEMENT SYSTEM - COMPLETE SETUP
 * =====================================
 * This script runs the complete system setup including:
 * 1. Database schema creation
 * 2. Sample data insertion
 * 3. System verification
 *
 * Usage: node scripts/system_setup.js
 */

const { setupDatabase } = require('./database_queries');
const { insertSampleData } = require('./sample_data_insertion');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'office_management',
};

// =====================================
// SYSTEM SETUP FUNCTIONS
// =====================================

async function runCompleteSetup() {
  console.log('🚀 Starting Complete Office Management System Setup...\n');

  try {
    // Step 1: Database Setup
    console.log('📦 STEP 1: Setting up database schema...');
    await setupDatabase();
    console.log('✅ Database schema setup completed\n');

    // Step 2: Sample Data Insertion
    console.log('📝 STEP 2: Inserting sample data...');
    await insertSampleData();
    console.log('✅ Sample data insertion completed\n');

    // Step 3: System Verification
    console.log('🔍 STEP 3: Verifying system setup...');
    await verifySystemSetup();
    console.log('✅ System verification completed\n');

    // Step 4: Display Summary
    displaySetupSummary();
  } catch (error) {
    console.error('❌ System setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Check MySQL server is running');
    console.error('   2. Verify database credentials in .env file');
    console.error('   3. Ensure proper permissions for database operations');
    console.error('   4. Check network connectivity');
    process.exit(1);
  }
}

async function verifySystemSetup() {
  let connection;

  try {
    connection = await mysql.createConnection(DB_CONFIG);

    // Check if all tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    const tableNames = tables.map((row) => Object.values(row)[0]);

    const requiredTables = [
      'departments',
      'offices',
      'admins',
      'employees',
      'complaints',
      'public_complaints',
      'feedbacks',
      'public_feedback',
      'ratings',
      'public_ratings',
      'activity_logs',
      'system_settings',
      'password_resets',
    ];

    console.log('   📊 Checking database tables...');
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`   ✅ Table '${table}' exists`);
      } else {
        throw new Error(`Required table '${table}' is missing`);
      }
    }

    // Check sample data
    console.log('   📋 Verifying sample data...');
    const [deptCount] = await connection.execute('SELECT COUNT(*) as count FROM departments');
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    const [empCount] = await connection.execute('SELECT COUNT(*) as count FROM employees');

    console.log(`   ✅ Departments: ${deptCount[0].count} records`);
    console.log(`   ✅ Admin users: ${adminCount[0].count} records`);
    console.log(`   ✅ Employees: ${empCount[0].count} records`);

    // Test admin login capability
    console.log('   🔐 Testing admin authentication...');
    const [admin] = await connection.execute(
      'SELECT username, role FROM admins WHERE username = ?',
      ['superadmin']
    );
    if (admin.length > 0) {
      console.log(`   ✅ SuperAdmin account exists: ${admin[0].username} (${admin[0].role})`);
    } else {
      throw new Error('SuperAdmin account not found');
    }
  } catch (error) {
    throw new Error(`System verification failed: ${error.message}`);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

function displaySetupSummary() {
  console.log('🎉 OFFICE MANAGEMENT SYSTEM SETUP COMPLETE!\n');

  console.log('📊 SYSTEM OVERVIEW:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🏢 Multi-Portal Office Management System');
  console.log('   • Admin Portal: Complete administrative control');
  console.log('   • Public Portal: Citizen complaints, feedback & ratings');
  console.log('   • Multi-language: English, Amharic, Afan Oromo');
  console.log('   • Role-based Access: SuperAdmin, SubCityAdmin, Admin');
  console.log('   • File Upload: Voice complaints and attachments');
  console.log('   • Real-time Tracking: Complaint and feedback tracking');
  console.log('');

  console.log('🔐 ADMIN ACCESS:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   SuperAdmin Login:');
  console.log('   • Username: superadmin');
  console.log('   • Password: password123');
  console.log('   • Access: Full system control');
  console.log('');
  console.log('   SubCity Admin Logins:');
  console.log('   • Username: bole_admin / Password: password123 (Bole Subcity)');
  console.log('   • Username: arada_admin / Password: password123 (Arada Subcity)');
  console.log('');
  console.log('   Department Admin Logins:');
  console.log('   • Username: control_admin / Password: password123 (Control & Awareness)');
  console.log('   • Username: engineering_admin / Password: password123 (Engineering)');
  console.log('   • Username: support_admin / Password: password123 (Support Admin)');
  console.log('   • Username: control_center_admin / Password: password123 (Control Center)');
  console.log('');

  console.log('🌐 API ENDPOINTS:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   Admin API Base: /api/admin/');
  console.log('   • POST /api/admin/login - Admin authentication');
  console.log('   • GET /api/admin/statistics - Dashboard statistics');
  console.log('   • GET /api/admin/complaints - Manage complaints');
  console.log('   • GET /api/admin/employees - Employee management');
  console.log('   • GET /api/admin/feedback - Feedback management');
  console.log('');
  console.log('   Public API Base: /api/');
  console.log('   • POST /api/complaints/submit - Submit complaints');
  console.log('   • POST /api/feedback/submit - Submit feedback');
  console.log('   • POST /api/ratings/submit - Submit ratings');
  console.log('   • GET /api/team - Public employee directory');
  console.log('   • GET /api/departments - Department information');
  console.log('');

  console.log('📱 CITIZEN FEATURES:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   • Submit text/voice complaints with tracking');
  console.log('   • Rate services and staff performance');
  console.log('   • Provide feedback and suggestions');
  console.log('   • Track complaint status with reference numbers');
  console.log('   • View public employee directory');
  console.log('   • Multi-language interface support');
  console.log('');

  console.log('⚙️ DATABASE FEATURES:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   • 13 Core tables with relationships');
  console.log('   • Full-text search capabilities');
  console.log('   • Performance-optimized indexes');
  console.log('   • Multi-language content support');
  console.log('   • Activity logging and monitoring');
  console.log('   • File attachment support');
  console.log('');

  console.log('🚀 NEXT STEPS:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('   1. Start the server: npm run dev');
  console.log('   2. Access admin portal: http://localhost:4000/api/admin/');
  console.log('   3. Test public endpoints: http://localhost:4000/api/');
  console.log('   4. Review API documentation: Check endpoints.md');
  console.log('   5. Configure environment variables as needed');
  console.log('');

  console.log('✅ System is ready for use and assessment!');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// =====================================
// DEVELOPMENT UTILITIES
// =====================================

async function resetSystem() {
  console.log('🔄 Resetting system (clearing all data)...');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);

    // Drop all tables
    const dropQueries = [
      'SET FOREIGN_KEY_CHECKS = 0;',
      'DROP TABLE IF EXISTS activity_logs;',
      'DROP TABLE IF EXISTS public_ratings;',
      'DROP TABLE IF EXISTS public_feedback;',
      'DROP TABLE IF EXISTS public_complaints;',
      'DROP TABLE IF EXISTS ratings;',
      'DROP TABLE IF EXISTS feedbacks;',
      'DROP TABLE IF EXISTS complaints;',
      'DROP TABLE IF EXISTS employees;',
      'DROP TABLE IF EXISTS offices;',
      'DROP TABLE IF EXISTS departments;',
      'DROP TABLE IF EXISTS password_resets;',
      'DROP TABLE IF EXISTS admins;',
      'DROP TABLE IF EXISTS system_settings;',
      'SET FOREIGN_KEY_CHECKS = 1;',
    ];

    for (const query of dropQueries) {
      await connection.execute(query);
    }

    console.log('✅ System reset completed');
  } catch (error) {
    console.error('❌ System reset failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function checkSystemHealth() {
  console.log('🔍 Checking system health...');

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);

    // Check database connection
    await connection.execute('SELECT 1');
    console.log('✅ Database connection: OK');

    // Check table integrity
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`✅ Database tables: ${tables.length} tables found`);

    // Check data integrity
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM admins');
    const [deptCount] = await connection.execute('SELECT COUNT(*) as count FROM departments');

    console.log(`✅ Admin users: ${adminCount[0].count}`);
    console.log(`✅ Departments: ${deptCount[0].count}`);

    console.log('🎉 System health check passed!');
  } catch (error) {
    console.error('❌ System health check failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// =====================================
// COMMAND LINE INTERFACE
// =====================================

const command = process.argv[2];

switch (command) {
  case 'setup':
  case undefined:
    runCompleteSetup();
    break;

  case 'reset':
    resetSystem()
      .then(() => console.log('System reset completed'))
      .catch(() => process.exit(1));
    break;

  case 'health':
    checkSystemHealth()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
    break;

  case 'help':
    console.log('\n🔧 Office Management System Setup Commands:');
    console.log('════════════════════════════════════════════');
    console.log('  node scripts/system_setup.js [command]');
    console.log('');
    console.log('  Commands:');
    console.log('    setup (default) - Run complete system setup');
    console.log('    reset          - Reset system (drop all data)');
    console.log('    health         - Check system health');
    console.log('    help           - Show this help message');
    console.log('');
    break;

  default:
    console.log(`❌ Unknown command: ${command}`);
    console.log('Run "node scripts/system_setup.js help" for available commands');
    process.exit(1);
}

// =====================================
// EXPORT MODULE
// =====================================

module.exports = {
  runCompleteSetup,
  verifySystemSetup,
  resetSystem,
  checkSystemHealth,
};
