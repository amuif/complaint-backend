const { Employee, Sector, Division, Department, Team } = require('../models');
const { initDb } = require('../services/databaseService');

// Sample employees with organizational assignments
const sampleEmployees = [
  // Public Administration - Administrative Services - Human Resources
  {
    first_name_en: 'Sarah',
    last_name_en: 'Johnson',
    position_en: 'HR Director',
    sectorName: 'Public Administration',
    divisionName: 'Administrative Services',
    departmentName: 'Human Resources',
    teamName: 'Recruitment Team',
    section: 'Central Administration',
    city: 'Addis Ababa',
    subcity: 'Bole',
  },
  {
    first_name_en: 'Michael',
    last_name_en: 'Chen',
    position_en: 'Recruitment Specialist',
    sectorName: 'Public Administration',
    divisionName: 'Administrative Services',
    departmentName: 'Human Resources',
    teamName: 'Employee Relations Team',
    section: 'Central Administration',
    city: 'Addis Ababa',
    subcity: 'Kirkos',
  },

  // Healthcare - Primary Healthcare - Family Medicine
  {
    first_name_en: 'Dr. Amara',
    last_name_en: 'Tadesse',
    position_en: 'Chief Medical Officer',
    sectorName: 'Healthcare',
    divisionName: 'Primary Healthcare',
    departmentName: 'Family Medicine',
    teamName: 'Primary Care Team',
    section: 'Medical Services',
    city: 'Addis Ababa',
    subcity: 'Yeka',
  },
  {
    first_name_en: 'Nurse Helen',
    last_name_en: 'Bekele',
    position_en: 'Senior Nurse',
    sectorName: 'Healthcare',
    divisionName: 'Emergency Services',
    departmentName: 'Emergency Response',
    teamName: 'First Response Team',
    section: 'Emergency Services',
    city: 'Addis Ababa',
    subcity: 'Arada',
  },

  // Education - Primary Education - Elementary Schools
  {
    first_name_en: 'Teacher Meron',
    last_name_en: 'Haile',
    position_en: 'Elementary Teacher',
    sectorName: 'Education',
    divisionName: 'Primary Education',
    departmentName: 'Elementary Schools',
    teamName: 'Grade 1-3 Teaching Team',
    section: 'Education Services',
    city: 'Addis Ababa',
    subcity: 'Gulele',
  },
  {
    first_name_en: 'Principal David',
    last_name_en: 'Wilson',
    position_en: 'School Principal',
    sectorName: 'Education',
    divisionName: 'Secondary Education',
    departmentName: 'High Schools',
    teamName: null,
    section: 'Education Services',
    city: 'Addis Ababa',
    subcity: 'Addis Ketema',
  },

  // Transportation - Public Transit - Bus Operations
  {
    first_name_en: 'Driver Ahmed',
    last_name_en: 'Mohammed',
    position_en: 'Bus Driver',
    sectorName: 'Transportation',
    divisionName: 'Public Transit',
    departmentName: 'Bus Operations',
    teamName: 'Route Operations Team',
    section: 'Transportation Services',
    city: 'Addis Ababa',
    subcity: 'Lideta',
  },
  {
    first_name_en: 'Mechanic Getachew',
    last_name_en: 'Alemu',
    position_en: 'Vehicle Mechanic',
    sectorName: 'Transportation',
    divisionName: 'Public Transit',
    departmentName: 'Bus Operations',
    teamName: 'Maintenance Team',
    section: 'Transportation Services',
    city: 'Addis Ababa',
    subcity: 'Kolfe Keranio',
  },

  // Urban Development - City Planning - Urban Design
  {
    first_name_en: 'Architect Lisa',
    last_name_en: 'Thompson',
    position_en: 'Urban Planner',
    sectorName: 'Urban Development',
    divisionName: 'City Planning',
    departmentName: 'Urban Design',
    teamName: 'City Design Team',
    section: 'Planning Services',
    city: 'Addis Ababa',
    subcity: 'Nifas Silk-Lafto',
  },
  {
    first_name_en: 'Inspector Dawit',
    last_name_en: 'Girma',
    position_en: 'Building Inspector',
    sectorName: 'Urban Development',
    divisionName: 'Community Development',
    departmentName: 'Housing Programs',
    teamName: 'Housing Development Team',
    section: 'Development Services',
    city: 'Addis Ababa',
    subcity: 'Akaky Kaliti',
  },

  // Finance - Tax Collection - Property Tax
  {
    first_name_en: 'Accountant Hanan',
    last_name_en: 'Yusuf',
    position_en: 'Senior Accountant',
    sectorName: 'Finance',
    divisionName: 'Tax Collection',
    departmentName: 'Property Tax',
    teamName: 'Assessment Team',
    section: 'Financial Services',
    city: 'Addis Ababa',
    subcity: 'Bole',
  },
  {
    first_name_en: 'Auditor Robert',
    last_name_en: 'Smith',
    position_en: 'Tax Auditor',
    sectorName: 'Finance',
    divisionName: 'Tax Collection',
    departmentName: 'Business Tax',
    teamName: null,
    section: 'Financial Services',
    city: 'Addis Ababa',
    subcity: 'Kirkos',
  },

  // Legal Affairs - Legal Counsel - Civil Law
  {
    first_name_en: 'Lawyer Tigist',
    last_name_en: 'Worku',
    position_en: 'Legal Counsel',
    sectorName: 'Legal Affairs',
    divisionName: 'Legal Counsel',
    departmentName: 'Civil Law',
    teamName: 'Litigation Team',
    section: 'Legal Services',
    city: 'Addis Ababa',
    subcity: 'Yeka',
  },
  {
    first_name_en: 'Legal Assistant',
    last_name_en: 'Kebede',
    position_en: 'Legal Assistant',
    sectorName: 'Legal Affairs',
    divisionName: 'Legal Counsel',
    departmentName: 'Civil Law',
    teamName: 'Legal Advisory Team',
    section: 'Legal Services',
    city: 'Addis Ababa',
    subcity: 'Arada',
  },

  // Technology - System Administration - Network Operations
  {
    first_name_en: 'IT Manager Alex',
    last_name_en: 'Rodriguez',
    position_en: 'IT Manager',
    sectorName: 'Technology',
    divisionName: 'System Administration',
    departmentName: 'Network Operations',
    teamName: 'Infrastructure Team',
    section: 'Technology Services',
    city: 'Addis Ababa',
    subcity: 'Gulele',
  },
  {
    first_name_en: 'Tech Support',
    last_name_en: 'Mulugeta',
    position_en: 'System Administrator',
    sectorName: 'Technology',
    divisionName: 'System Administration',
    departmentName: 'Network Operations',
    teamName: 'Security Team',
    section: 'Technology Services',
    city: 'Addis Ababa',
    subcity: 'Addis Ketema',
  },
];

async function createSampleEmployeesWithHierarchy() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Check if employees already exist
    const existingEmployees = await Employee.findAll();
    if (existingEmployees.length > 0) {
      console.log('ℹ️  Employees already exist in database');
      console.log(`Found ${existingEmployees.length} existing employees`);

      // Ask if user wants to add more employees
      console.log('Adding sample employees with organizational hierarchy...');
    }

    // Get all organizational hierarchy data
    const sectors = await Sector.findAll();
    const divisions = await Division.findAll();
    const departments = await Department.findAll();
    const teams = await Team.findAll();

    if (sectors.length === 0 || divisions.length === 0 || departments.length === 0) {
      console.log(
        '❌ Organizational hierarchy not found. Please run the hierarchy setup scripts first:'
      );
      console.log('  - node scripts/insert_sectors.js');
      console.log('  - node scripts/insert_divisions.js');
      console.log('  - node scripts/insert_departments_with_divisions.js');
      console.log('  - node scripts/insert_teams.js');
      return;
    }

    // Create lookup maps
    const sectorMap = {};
    const divisionMap = {};
    const departmentMap = {};
    const teamMap = {};

    sectors.forEach((sector) => {
      sectorMap[sector.name] = sector.id;
    });

    divisions.forEach((division) => {
      divisionMap[division.name] = division.id;
    });

    departments.forEach((department) => {
      departmentMap[department.name] = department.id;
    });

    teams.forEach((team) => {
      teamMap[team.name] = team.id;
    });

    console.log('📝 Creating sample employees with organizational hierarchy...');

    let createdCount = 0;
    for (const employeeData of sampleEmployees) {
      // Get the IDs for the organizational hierarchy
      const sectorId = sectorMap[employeeData.sectorName];
      const divisionId = divisionMap[employeeData.divisionName];
      const departmentId = departmentMap[employeeData.departmentName];
      const teamId = employeeData.teamName ? teamMap[employeeData.teamName] : null;

      if (!sectorId || !divisionId || !departmentId) {
        console.log(
          `❌ Could not find hierarchy IDs for: ${employeeData.sectorName} -> ${employeeData.divisionName} -> ${employeeData.departmentName}`
        );
        continue;
      }

      // Check if employee already exists
      const existingEmployee = await Employee.findOne({
        where: {
          first_name_en: employeeData.first_name_en,
          last_name_en: employeeData.last_name_en,
        },
      });

      if (existingEmployee) {
        console.log(
          `ℹ️  Employee '${employeeData.first_name_en} ${employeeData.last_name_en}' already exists, skipping`
        );
        continue;
      }

      await Employee.create({
        first_name_en: employeeData.first_name_en,
        last_name_en: employeeData.last_name_en,
        position_en: employeeData.position_en,
        department_en: employeeData.departmentName, // Keep legacy field for compatibility
        section: employeeData.section,
        city: employeeData.city,
        subcity: employeeData.subcity,
        sector_id: sectorId,
        division_id: divisionId,
        department_id: departmentId,
        team_id: teamId,
      });

      console.log(
        `✅ Created employee: ${employeeData.first_name_en} ${employeeData.last_name_en} (${employeeData.position_en})`
      );
      console.log(
        `   -> ${employeeData.sectorName} -> ${employeeData.divisionName} -> ${employeeData.departmentName}${employeeData.teamName ? ' -> ' + employeeData.teamName : ''}`
      );
      createdCount++;
    }

    console.log(`🎉 ${createdCount} employees created successfully!`);

    // Verify creation
    const totalEmployees = await Employee.count();
    console.log(`📊 Total employees in database: ${totalEmployees}`);

    // Show employees by organizational hierarchy
    console.log('\n📋 Employees by Sector:');
    for (const sector of sectors) {
      const employeeCount = await Employee.count({
        where: { sector_id: sector.id },
      });
      if (employeeCount > 0) {
        console.log(`  ${sector.name}: ${employeeCount} employees`);
      }
    }
  } catch (error) {
    console.error('❌ Error creating sample employees:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
createSampleEmployeesWithHierarchy();
