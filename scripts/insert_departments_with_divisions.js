const { Sector, Division, Department } = require('../models');
const { initDb } = require('../services/databaseService');

const sampleDepartments = [
  // Administrative Services departments
  { name: 'Human Resources', divisionName: 'Administrative Services' },
  { name: 'Finance and Accounting', divisionName: 'Administrative Services' },
  { name: 'General Administration', divisionName: 'Administrative Services' },

  // Policy Development departments
  { name: 'Strategic Planning', divisionName: 'Policy Development' },
  { name: 'Research and Analysis', divisionName: 'Policy Development' },
  { name: 'Policy Implementation', divisionName: 'Policy Development' },

  // Public Relations departments
  { name: 'Media Relations', divisionName: 'Public Relations' },
  { name: 'Community Outreach', divisionName: 'Public Relations' },
  { name: 'Communications', divisionName: 'Public Relations' },

  // Primary Healthcare departments
  { name: 'Family Medicine', divisionName: 'Primary Healthcare' },
  { name: 'Preventive Care', divisionName: 'Primary Healthcare' },
  { name: 'Maternal Health', divisionName: 'Primary Healthcare' },

  // Emergency Services departments
  { name: 'Emergency Response', divisionName: 'Emergency Services' },
  { name: 'Ambulance Services', divisionName: 'Emergency Services' },
  { name: 'Disaster Management', divisionName: 'Emergency Services' },

  // Primary Education departments
  { name: 'Elementary Schools', divisionName: 'Primary Education' },
  { name: 'Curriculum Development', divisionName: 'Primary Education' },
  { name: 'Teacher Training', divisionName: 'Primary Education' },

  // Secondary Education departments
  { name: 'High Schools', divisionName: 'Secondary Education' },
  { name: 'Vocational Training', divisionName: 'Secondary Education' },
  { name: 'Student Assessment', divisionName: 'Secondary Education' },

  // Public Transit departments
  { name: 'Bus Operations', divisionName: 'Public Transit' },
  { name: 'Route Planning', divisionName: 'Public Transit' },
  { name: 'Transit Maintenance', divisionName: 'Public Transit' },

  // Traffic Management departments
  { name: 'Traffic Control', divisionName: 'Traffic Management' },
  { name: 'Traffic Enforcement', divisionName: 'Traffic Management' },
  { name: 'Signal Systems', divisionName: 'Traffic Management' },

  // Community Development departments
  { name: 'Housing Programs', divisionName: 'Community Development' },
  { name: 'Economic Development', divisionName: 'Community Development' },
  { name: 'Neighborhood Services', divisionName: 'Community Development' },

  // City Planning departments
  { name: 'Urban Design', divisionName: 'City Planning' },
  { name: 'Land Use Planning', divisionName: 'City Planning' },
  { name: 'Environmental Planning', divisionName: 'City Planning' },

  // Tax Collection departments
  { name: 'Property Tax', divisionName: 'Tax Collection' },
  { name: 'Business Tax', divisionName: 'Tax Collection' },
  { name: 'Tax Assessment', divisionName: 'Tax Collection' },

  // Legal Counsel departments
  { name: 'Civil Law', divisionName: 'Legal Counsel' },
  { name: 'Administrative Law', divisionName: 'Legal Counsel' },
  { name: 'Legal Research', divisionName: 'Legal Counsel' },

  // System Administration departments
  { name: 'Network Operations', divisionName: 'System Administration' },
  { name: 'Database Management', divisionName: 'System Administration' },
  { name: 'Security Operations', divisionName: 'System Administration' },
];

async function insertDepartmentsWithDivisions() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Get all divisions to map names to IDs
    const divisions = await Division.findAll({
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
        },
      ],
    });

    if (divisions.length === 0) {
      console.log('❌ No divisions found. Please run insert_divisions.js first');
      return;
    }

    const divisionMap = {};
    divisions.forEach((division) => {
      divisionMap[division.name] = division.id;
    });

    console.log('📝 Inserting sample departments with division relationships...');

    let insertedCount = 0;
    for (const departmentData of sampleDepartments) {
      const divisionId = divisionMap[departmentData.divisionName];

      if (!divisionId) {
        console.log(
          `⚠️  Division '${departmentData.divisionName}' not found, skipping department '${departmentData.name}'`
        );
        continue;
      }

      // Check if department already exists
      const existingDepartment = await Department.findOne({
        where: {
          name: departmentData.name,
          division_id: divisionId,
        },
      });

      if (existingDepartment) {
        console.log(`ℹ️  Department '${departmentData.name}' already exists, skipping`);
        continue;
      }

      await Department.create({
        name: departmentData.name,
        division_id: divisionId,
      });

      console.log(
        `✅ Created department: ${departmentData.name} (Division: ${departmentData.divisionName})`
      );
      insertedCount++;
    }

    console.log(`🎉 ${insertedCount} departments inserted successfully!`);

    // Verify insertion
    const totalDepartments = await Department.count();
    console.log(`📊 Total departments in database: ${totalDepartments}`);

    // Show departments by division
    console.log('\n📋 Departments by Division:');
    for (const division of divisions) {
      const departmentsInDivision = await Department.findAll({
        where: { division_id: division.id },
        order: [['name', 'ASC']],
      });

      if (departmentsInDivision.length > 0) {
        console.log(
          `\n${division.name} - ${division.sector.name} (${departmentsInDivision.length} departments):`
        );
        departmentsInDivision.forEach((department) => {
          console.log(`  - ${department.name}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error inserting departments:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
insertDepartmentsWithDivisions();
