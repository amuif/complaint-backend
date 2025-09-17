const { Sector, Division, Department, Team } = require('../models');
const { initDb } = require('../services/databaseService');

const sampleTeams = [
  // Human Resources teams
  { name: 'Recruitment Team', departmentName: 'Human Resources' },
  { name: 'Employee Relations Team', departmentName: 'Human Resources' },
  { name: 'Training & Development Team', departmentName: 'Human Resources' },

  // Finance and Accounting teams
  { name: 'Budget Planning Team', departmentName: 'Finance and Accounting' },
  { name: 'Financial Analysis Team', departmentName: 'Finance and Accounting' },
  { name: 'Accounts Payable Team', departmentName: 'Finance and Accounting' },

  // General Administration teams
  { name: 'Office Management Team', departmentName: 'General Administration' },
  { name: 'Records Management Team', departmentName: 'General Administration' },
  { name: 'Facilities Team', departmentName: 'General Administration' },

  // Strategic Planning teams
  { name: 'Long-term Planning Team', departmentName: 'Strategic Planning' },
  { name: 'Performance Monitoring Team', departmentName: 'Strategic Planning' },
  { name: 'Strategic Analysis Team', departmentName: 'Strategic Planning' },

  // Research and Analysis teams
  { name: 'Data Research Team', departmentName: 'Research and Analysis' },
  { name: 'Policy Research Team', departmentName: 'Research and Analysis' },
  { name: 'Market Analysis Team', departmentName: 'Research and Analysis' },

  // Media Relations teams
  { name: 'Press Relations Team', departmentName: 'Media Relations' },
  { name: 'Social Media Team', departmentName: 'Media Relations' },
  { name: 'Content Creation Team', departmentName: 'Media Relations' },

  // Family Medicine teams
  { name: 'Primary Care Team', departmentName: 'Family Medicine' },
  { name: 'Pediatric Care Team', departmentName: 'Family Medicine' },
  { name: 'Geriatric Care Team', departmentName: 'Family Medicine' },

  // Emergency Response teams
  { name: 'First Response Team', departmentName: 'Emergency Response' },
  { name: 'Crisis Management Team', departmentName: 'Emergency Response' },
  { name: 'Emergency Coordination Team', departmentName: 'Emergency Response' },

  // Elementary Schools teams
  { name: 'Grade 1-3 Teaching Team', departmentName: 'Elementary Schools' },
  { name: 'Grade 4-6 Teaching Team', departmentName: 'Elementary Schools' },
  { name: 'Special Education Team', departmentName: 'Elementary Schools' },

  // Bus Operations teams
  { name: 'Route Operations Team', departmentName: 'Bus Operations' },
  { name: 'Maintenance Team', departmentName: 'Bus Operations' },
  { name: 'Driver Management Team', departmentName: 'Bus Operations' },

  // Traffic Control teams
  { name: 'Signal Control Team', departmentName: 'Traffic Control' },
  { name: 'Intersection Management Team', departmentName: 'Traffic Control' },
  { name: 'Traffic Flow Team', departmentName: 'Traffic Control' },

  // Housing Programs teams
  { name: 'Affordable Housing Team', departmentName: 'Housing Programs' },
  { name: 'Housing Assistance Team', departmentName: 'Housing Programs' },
  { name: 'Housing Development Team', departmentName: 'Housing Programs' },

  // Urban Design teams
  { name: 'City Design Team', departmentName: 'Urban Design' },
  { name: 'Landscape Architecture Team', departmentName: 'Urban Design' },
  { name: 'Public Spaces Team', departmentName: 'Urban Design' },

  // Property Tax teams
  { name: 'Assessment Team', departmentName: 'Property Tax' },
  { name: 'Collection Team', departmentName: 'Property Tax' },
  { name: 'Appeals Team', departmentName: 'Property Tax' },

  // Civil Law teams
  { name: 'Litigation Team', departmentName: 'Civil Law' },
  { name: 'Contract Review Team', departmentName: 'Civil Law' },
  { name: 'Legal Advisory Team', departmentName: 'Civil Law' },

  // Network Operations teams
  { name: 'Infrastructure Team', departmentName: 'Network Operations' },
  { name: 'Security Team', departmentName: 'Network Operations' },
  { name: 'Monitoring Team', departmentName: 'Network Operations' },
];

async function insertTeams() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Check if teams already exist
    const existingTeams = await Team.findAll();
    if (existingTeams.length > 0) {
      console.log('ℹ️  Teams already exist in database');
      console.log(`Found ${existingTeams.length} existing teams`);
      return;
    }

    // Get all departments to map names to IDs
    const departments = await Department.findAll({
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name'],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name_en', 'name_af', 'name_am'],
            },
          ],
        },
      ],
    });

    if (departments.length === 0) {
      console.log('❌ No departments found. Please run insert_departments_with_divisions.js first');
      return;
    }

    const departmentMap = {};
    departments.forEach((department) => {
      departmentMap[department.name] = department.id;
    });

    console.log('📝 Inserting sample teams...');

    let insertedCount = 0;
    for (const teamData of sampleTeams) {
      const departmentId = departmentMap[teamData.departmentName];

      if (!departmentId) {
        console.log(
          `⚠️  Department '${teamData.departmentName}' not found, skipping team '${teamData.name}'`
        );
        continue;
      }

      await Team.create({
        name: teamData.name,
        department_id: departmentId,
      });

      console.log(`✅ Created team: ${teamData.name} (Department: ${teamData.departmentName})`);
      insertedCount++;
    }

    console.log(`🎉 ${insertedCount} teams inserted successfully!`);

    // Verify insertion
    const totalTeams = await Team.count();
    console.log(`📊 Total teams in database: ${totalTeams}`);

    // Show teams by department
    console.log('\n📋 Teams by Department:');
    for (const department of departments) {
      const teamsInDepartment = await Team.findAll({
        where: { department_id: department.id },
        order: [['name', 'ASC']],
      });

      if (teamsInDepartment.length > 0) {
        console.log(
          `\n${department.name} - ${department.division.name} - ${department.division.sector.name} (${teamsInDepartment.length} teams):`
        );
        teamsInDepartment.forEach((team) => {
          console.log(`  - ${team.name}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error inserting teams:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
insertTeams();
