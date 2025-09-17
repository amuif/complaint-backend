/**
 * =====================================
 * TEST COMPLAINT HIERARCHY INTEGRATION
 * =====================================
 * This script tests the complaint hierarchy integration by creating
 * sample complaints with organizational hierarchy assignments
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'office_management',
  charset: 'utf8mb4',
};

async function testComplaintHierarchy() {
  let connection;

  try {
    console.log('🧪 Starting complaint hierarchy integration test...');

    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // =====================================
    // 1. VERIFY HIERARCHY DATA EXISTS
    // =====================================

    console.log('🔍 Verifying organizational hierarchy data...');

    const [sectors] = await connection.execute('SELECT COUNT(*) as count FROM sectors');
    const [divisions] = await connection.execute('SELECT COUNT(*) as count FROM divisions');
    const [departments] = await connection.execute('SELECT COUNT(*) as count FROM departments');
    const [teams] = await connection.execute('SELECT COUNT(*) as count FROM teams');

    console.log(`📊 Hierarchy Data Summary:`);
    console.log(`  Sectors: ${sectors[0].count}`);
    console.log(`  Divisions: ${divisions[0].count}`);
    console.log(`  Departments: ${departments[0].count}`);
    console.log(`  Teams: ${teams[0].count}`);

    if (sectors[0].count === 0) {
      console.log(
        '⚠️ No organizational hierarchy data found. Please run the hierarchy insertion script first.'
      );
      return;
    }

    // =====================================
    // 2. VERIFY TABLE STRUCTURE
    // =====================================

    console.log('🔍 Verifying table structures...');

    // Check complaints table structure
    const [complaintsColumns] = await connection.execute(
      `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints'
      AND COLUMN_NAME IN ('sector_id', 'division_id', 'department_id', 'team_id')
    `,
      [DB_CONFIG.database]
    );

    console.log('📋 Complaints table hierarchy columns:');
    complaintsColumns.forEach((col) => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // Check public_complaints table structure
    const [publicComplaintsColumns] = await connection.execute(
      `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'public_complaints'
      AND COLUMN_NAME IN ('sector_id', 'division_id', 'department_id', 'team_id')
    `,
      [DB_CONFIG.database]
    );

    console.log('📋 Public complaints table hierarchy columns:');
    publicComplaintsColumns.forEach((col) => {
      console.log(`  ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE})`);
    });

    // =====================================
    // 3. CREATE TEST COMPLAINTS
    // =====================================

    console.log('📝 Creating test complaints with hierarchy assignments...');

    // Get sample hierarchy data
    const [sampleSectors] = await connection.execute('SELECT id, name FROM sectors LIMIT 3');
    const [sampleDivisions] = await connection.execute(
      'SELECT id, name, sector_id FROM divisions LIMIT 3'
    );
    const [sampleDepartments] = await connection.execute(
      'SELECT id, name, division_id FROM departments LIMIT 3'
    );
    const [sampleTeams] = await connection.execute(
      'SELECT id, name, department_id FROM teams LIMIT 3'
    );

    // Create test internal complaints
    const testComplaints = [
      {
        complainant_name: 'Test User 1',
        phone_number: '0911234567',
        section: 'Test Section 1',
        department: 'Test Department 1',
        description_en: 'Test complaint with full hierarchy',
        desired_action_en: 'Test resolution',
        tracking_code: `TC${Date.now()}1`,
        sector_id: sampleSectors[0]?.id || 1,
        division_id: sampleDivisions[0]?.id || 1,
        department_id: sampleDepartments[0]?.id || 1,
        team_id: sampleTeams[0]?.id || 1,
      },
      {
        complainant_name: 'Test User 2',
        phone_number: '0911234568',
        section: 'Test Section 2',
        department: 'Test Department 2',
        description_en: 'Test complaint with partial hierarchy',
        desired_action_en: 'Test resolution 2',
        tracking_code: `TC${Date.now()}2`,
        sector_id: sampleSectors[1]?.id || 2,
        division_id: sampleDivisions[1]?.id || 2,
        department_id: null,
        team_id: null,
      },
    ];

    for (const complaint of testComplaints) {
      try {
        await connection.execute(
          `
          INSERT INTO complaints (
            complainant_name, phone_number, section, department, 
            description_en, desired_action_en, tracking_code, status,
            sector_id, division_id, department_id, team_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, NOW())
        `,
          [
            complaint.complainant_name,
            complaint.phone_number,
            complaint.section,
            complaint.department,
            complaint.description_en,
            complaint.desired_action_en,
            complaint.tracking_code,
            complaint.sector_id,
            complaint.division_id,
            complaint.department_id,
            complaint.team_id,
          ]
        );
        console.log(`✅ Created internal complaint: ${complaint.complainant_name}`);
      } catch (error) {
        console.log(`⚠️ Failed to create internal complaint: ${error.message}`);
      }
    }

    // Create test public complaints
    const testPublicComplaints = [
      {
        complainant_name: 'Public User 1',
        phone_number: '0911234569',
        sub_city: 'Test Sub City',
        kebele: 'Test Kebele',
        complaint_description: 'Test public complaint with hierarchy',
        department: 'Public Department 1',
        office: 'Public Office 1',
        desired_action: 'Public resolution',
        tracking_code: `PC${Date.now()}1`,
        sector_id: sampleSectors[2]?.id || 3,
        division_id: sampleDivisions[2]?.id || 3,
        department_id: sampleDepartments[2]?.id || 3,
        team_id: null,
      },
    ];

    for (const complaint of testPublicComplaints) {
      try {
        await connection.execute(
          `
          INSERT INTO public_complaints (
            complainant_name, phone_number, sub_city, kebele,
            complaint_description, department, office, desired_action,
            tracking_code, status, sector_id, division_id, department_id, team_id,
            complaint_date, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, NOW(), NOW())
        `,
          [
            complaint.complainant_name,
            complaint.phone_number,
            complaint.sub_city,
            complaint.kebele,
            complaint.complaint_description,
            complaint.department,
            complaint.office,
            complaint.desired_action,
            complaint.tracking_code,
            complaint.sector_id,
            complaint.division_id,
            complaint.department_id,
            complaint.team_id,
          ]
        );
        console.log(`✅ Created public complaint: ${complaint.complainant_name}`);
      } catch (error) {
        console.log(`⚠️ Failed to create public complaint: ${error.message}`);
      }
    }

    // =====================================
    // 4. TEST HIERARCHY QUERIES
    // =====================================

    console.log('🔍 Testing hierarchy-based queries...');

    // Test complaints by sector
    const [complaintsBySector] = await connection.execute(
      `
      SELECT 
        c.id,
        c.complainant_name,
        c.tracking_code,
        s.name as sector_name,
        d.name as division_name,
        dept.name as department_name,
        t.name as team_name
      FROM complaints c
      LEFT JOIN sectors s ON c.sector_id = s.id
      LEFT JOIN divisions d ON c.division_id = d.id
      LEFT JOIN departments dept ON c.department_id = dept.id
      LEFT JOIN teams t ON c.team_id = t.id
      WHERE c.sector_id = ?
      ORDER BY c.created_at DESC
      LIMIT 5
    `,
      [sampleSectors[0]?.id || 1]
    );

    console.log(`📊 Complaints for sector "${sampleSectors[0]?.name || 'Unknown'}":`);
    complaintsBySector.forEach((complaint) => {
      console.log(
        `  ${complaint.complainant_name} (${complaint.tracking_code}) - ${complaint.sector_name} > ${complaint.division_name} > ${complaint.department_name || 'N/A'} > ${complaint.team_name || 'N/A'}`
      );
    });

    // Test public complaints by division
    const [publicComplaintsByDivision] = await connection.execute(`
      SELECT 
        pc.id,
        pc.complainant_name,
        pc.tracking_code,
        s.name as sector_name,
        d.name as division_name,
        dept.name as department_name
      FROM public_complaints pc
      LEFT JOIN sectors s ON pc.sector_id = s.id
      LEFT JOIN divisions d ON pc.division_id = d.id
      LEFT JOIN departments dept ON pc.department_id = dept.id
      WHERE pc.division_id IS NOT NULL
      ORDER BY pc.created_at DESC
      LIMIT 5
    `);

    console.log(`📊 Public complaints with division assignments:`);
    publicComplaintsByDivision.forEach((complaint) => {
      console.log(
        `  ${complaint.complainant_name} (${complaint.tracking_code}) - ${complaint.sector_name} > ${complaint.division_name} > ${complaint.department_name || 'N/A'}`
      );
    });

    // =====================================
    // 5. GENERATE SUMMARY REPORT
    // =====================================

    console.log('📊 Generating summary report...');

    const [summaryStats] = await connection.execute(`
      SELECT 
        'Internal Complaints' as complaint_type,
        COUNT(*) as total,
        COUNT(sector_id) as with_sector,
        COUNT(division_id) as with_division,
        COUNT(department_id) as with_department,
        COUNT(team_id) as with_team
      FROM complaints
      UNION ALL
      SELECT 
        'Public Complaints' as complaint_type,
        COUNT(*) as total,
        COUNT(sector_id) as with_sector,
        COUNT(division_id) as with_division,
        COUNT(department_id) as with_department,
        COUNT(team_id) as with_team
      FROM public_complaints
    `);

    console.log('\n📈 Complaint Hierarchy Integration Summary:');
    console.log('==========================================');
    summaryStats.forEach((stat) => {
      console.log(`${stat.complaint_type}:`);
      console.log(`  Total: ${stat.total}`);
      console.log(
        `  With Sector: ${stat.with_sector} (${((stat.with_sector / stat.total) * 100).toFixed(1)}%)`
      );
      console.log(
        `  With Division: ${stat.with_division} (${((stat.with_division / stat.total) * 100).toFixed(1)}%)`
      );
      console.log(
        `  With Department: ${stat.with_department} (${((stat.with_department / stat.total) * 100).toFixed(1)}%)`
      );
      console.log(
        `  With Team: ${stat.with_team} (${((stat.with_team / stat.total) * 100).toFixed(1)}%)`
      );
      console.log('');
    });

    console.log('🎉 Complaint hierarchy integration test completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Update your frontend forms to include hierarchy selection dropdowns');
    console.log('2. Test the new complaint hierarchy filtering endpoints');
    console.log('3. Update complaint management workflows to use hierarchy information');
    console.log('4. Consider adding hierarchy-based reporting and analytics');
  } catch (error) {
    console.error('❌ Error during test:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
if (require.main === module) {
  testComplaintHierarchy()
    .then(() => {
      console.log('✅ Test script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testComplaintHierarchy };
