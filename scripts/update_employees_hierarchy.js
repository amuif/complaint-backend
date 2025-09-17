const { Employee, Sector, Division, Department, Team } = require('../models');
const { initDb } = require('../services/databaseService');

// Sample employee assignments to organizational hierarchy
const employeeHierarchyAssignments = [
  // Public Administration - Administrative Services - Human Resources
  {
    employeePattern: 'HR',
    sectorName: 'Public Administration',
    divisionName: 'Administrative Services',
    departmentName: 'Human Resources',
    teamName: 'Recruitment Team',
  },
  {
    employeePattern: 'Admin',
    sectorName: 'Public Administration',
    divisionName: 'Administrative Services',
    departmentName: 'General Administration',
    teamName: 'Office Management Team',
  },

  // Healthcare - Primary Healthcare - Family Medicine
  {
    employeePattern: 'Dr',
    sectorName: 'Healthcare',
    divisionName: 'Primary Healthcare',
    departmentName: 'Family Medicine',
    teamName: 'Primary Care Team',
  },
  {
    employeePattern: 'Nurse',
    sectorName: 'Healthcare',
    divisionName: 'Emergency Services',
    departmentName: 'Emergency Response',
    teamName: 'First Response Team',
  },

  // Education - Primary Education - Elementary Schools
  {
    employeePattern: 'Teacher',
    sectorName: 'Education',
    divisionName: 'Primary Education',
    departmentName: 'Elementary Schools',
    teamName: 'Grade 1-3 Teaching Team',
  },
  {
    employeePattern: 'Principal',
    sectorName: 'Education',
    divisionName: 'Secondary Education',
    departmentName: 'High Schools',
    teamName: null,
  },

  // Transportation - Public Transit - Bus Operations
  {
    employeePattern: 'Driver',
    sectorName: 'Transportation',
    divisionName: 'Public Transit',
    departmentName: 'Bus Operations',
    teamName: 'Route Operations Team',
  },
  {
    employeePattern: 'Mechanic',
    sectorName: 'Transportation',
    divisionName: 'Public Transit',
    departmentName: 'Bus Operations',
    teamName: 'Maintenance Team',
  },

  // Urban Development - Community Development - Housing Programs
  {
    employeePattern: 'Planner',
    sectorName: 'Urban Development',
    divisionName: 'City Planning',
    departmentName: 'Urban Design',
    teamName: 'City Design Team',
  },
  {
    employeePattern: 'Inspector',
    sectorName: 'Urban Development',
    divisionName: 'Community Development',
    departmentName: 'Housing Programs',
    teamName: 'Housing Development Team',
  },

  // Finance - Tax Collection - Property Tax
  {
    employeePattern: 'Accountant',
    sectorName: 'Finance',
    divisionName: 'Tax Collection',
    departmentName: 'Property Tax',
    teamName: 'Assessment Team',
  },
  {
    employeePattern: 'Auditor',
    sectorName: 'Finance',
    divisionName: 'Tax Collection',
    departmentName: 'Business Tax',
    teamName: null,
  },

  // Legal Affairs - Legal Counsel - Civil Law
  {
    employeePattern: 'Lawyer',
    sectorName: 'Legal Affairs',
    divisionName: 'Legal Counsel',
    departmentName: 'Civil Law',
    teamName: 'Litigation Team',
  },
  {
    employeePattern: 'Legal',
    sectorName: 'Legal Affairs',
    divisionName: 'Legal Counsel',
    departmentName: 'Civil Law',
    teamName: 'Legal Advisory Team',
  },

  // Technology - System Administration - Network Operations
  {
    employeePattern: 'IT',
    sectorName: 'Technology',
    divisionName: 'System Administration',
    departmentName: 'Network Operations',
    teamName: 'Infrastructure Team',
  },
  {
    employeePattern: 'Tech',
    sectorName: 'Technology',
    divisionName: 'System Administration',
    departmentName: 'Network Operations',
    teamName: 'Security Team',
  },
];

async function updateEmployeesHierarchy() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

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

    console.log('📊 Organizational hierarchy loaded:');
    console.log(`  - ${sectors.length} sectors`);
    console.log(`  - ${divisions.length} divisions`);
    console.log(`  - ${departments.length} departments`);
    console.log(`  - ${teams.length} teams`);

    // Get all employees
    const employees = await Employee.findAll();

    if (employees.length === 0) {
      console.log('ℹ️  No employees found in database');
      return;
    }

    console.log(`\n📝 Found ${employees.length} employees to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const employee of employees) {
      // Find matching assignment based on employee data
      let assignment = null;

      // Check position, department, or name for patterns
      const searchText = [
        employee.position_en,
        employee.department_en,
        employee.first_name_en,
        employee.last_name_en,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      for (const assign of employeeHierarchyAssignments) {
        if (searchText.includes(assign.employeePattern.toLowerCase())) {
          assignment = assign;
          break;
        }
      }

      // If no specific assignment found, assign to a default based on department
      if (!assignment && employee.department_en) {
        const deptName = employee.department_en.toLowerCase();
        if (deptName.includes('hr') || deptName.includes('human')) {
          assignment = employeeHierarchyAssignments.find(
            (a) => a.departmentName === 'Human Resources'
          );
        } else if (deptName.includes('finance') || deptName.includes('accounting')) {
          assignment = employeeHierarchyAssignments.find(
            (a) => a.departmentName === 'Finance and Accounting'
          );
        } else if (deptName.includes('admin')) {
          assignment = employeeHierarchyAssignments.find(
            (a) => a.departmentName === 'General Administration'
          );
        }
      }

      // If still no assignment, use a default
      if (!assignment) {
        assignment = employeeHierarchyAssignments[0]; // Default to HR
        console.log(
          `⚠️  Using default assignment for employee ${employee.id}: ${employee.first_name_en} ${employee.last_name_en}`
        );
      }

      // Get the IDs for the assignment
      const sectorId = sectorMap[assignment.sectorName];
      const divisionId = divisionMap[assignment.divisionName];
      const departmentId = departmentMap[assignment.departmentName];
      const teamId = assignment.teamName ? teamMap[assignment.teamName] : null;

      if (!sectorId || !divisionId || !departmentId) {
        console.log(
          `❌ Could not find hierarchy IDs for assignment: ${assignment.sectorName} -> ${assignment.divisionName} -> ${assignment.departmentName}`
        );
        skippedCount++;
        continue;
      }

      // Update the employee
      await employee.update({
        sector_id: sectorId,
        division_id: divisionId,
        department_id: departmentId,
        team_id: teamId,
      });

      console.log(
        `✅ Updated employee ${employee.id}: ${employee.first_name_en} ${employee.last_name_en}`
      );
      console.log(
        `   -> ${assignment.sectorName} -> ${assignment.divisionName} -> ${assignment.departmentName}${assignment.teamName ? ' -> ' + assignment.teamName : ''}`
      );

      updatedCount++;
    }

    console.log(`\n🎉 Employee hierarchy update completed!`);
    console.log(`✅ Updated: ${updatedCount} employees`);
    console.log(`⚠️  Skipped: ${skippedCount} employees`);

    // Verify the updates
    console.log('\n📊 Verification - Employees by Sector:');
    for (const sector of sectors) {
      const employeeCount = await Employee.count({
        where: { sector_id: sector.id },
      });
      if (employeeCount > 0) {
        console.log(`  ${sector.name}: ${employeeCount} employees`);
      }
    }
  } catch (error) {
    console.error('❌ Error updating employee hierarchy:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
updateEmployeesHierarchy();
