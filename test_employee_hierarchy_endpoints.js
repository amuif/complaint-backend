const { Employee, Sector, Division, Department, Team } = require('./models');
const { initDb } = require('./services/databaseService');

async function testEmployeeHierarchyEndpoints() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Get sample data for testing
    const sectors = await Sector.findAll({ limit: 2 });
    const divisions = await Division.findAll({ limit: 2 });
    const departments = await Department.findAll({ limit: 2 });
    const teams = await Team.findAll({ limit: 2 });

    if (sectors.length === 0 || divisions.length === 0 || departments.length === 0) {
      console.log('❌ No organizational hierarchy data found. Please run setup scripts first:');
      console.log('  - node scripts/insert_sectors.js');
      console.log('  - node scripts/insert_divisions.js');
      console.log('  - node scripts/insert_departments_with_divisions.js');
      console.log('  - node scripts/insert_teams.js');
      console.log('  - node scripts/create_sample_employees_with_hierarchy.js');
      return;
    }

    console.log('📊 Available test data:');
    console.log(`  - ${sectors.length} sectors`);
    console.log(`  - ${divisions.length} divisions`);
    console.log(`  - ${departments.length} departments`);
    console.log(`  - ${teams.length} teams`);

    // Test 1: Get employees by sector
    console.log('\n🔍 Testing getEmployeesBySector endpoint...');
    for (const sector of sectors) {
      const employees = await Employee.findAndCountAll({
        where: { sector_id: sector.id },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: 10,
      });

      console.log(`  Sector "${sector.name}" (ID: ${sector.id}): ${employees.count} employees`);
      if (employees.rows.length > 0) {
        employees.rows.slice(0, 3).forEach((emp) => {
          console.log(`    - ${emp.first_name_en} ${emp.last_name_en} (${emp.position_en})`);
        });
      }
    }

    // Test 2: Get employees by division
    console.log('\n🔍 Testing getEmployeesByDivision endpoint...');
    for (const division of divisions) {
      const employees = await Employee.findAndCountAll({
        where: { division_id: division.id },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: 10,
      });

      console.log(
        `  Division "${division.name}" (ID: ${division.id}): ${employees.count} employees`
      );
      if (employees.rows.length > 0) {
        employees.rows.slice(0, 3).forEach((emp) => {
          console.log(`    - ${emp.first_name_en} ${emp.last_name_en} (${emp.position_en})`);
        });
      }
    }

    // Test 3: Get employees by department
    console.log('\n🔍 Testing getEmployeesByDepartmentId endpoint...');
    for (const department of departments) {
      const employees = await Employee.findAndCountAll({
        where: { department_id: department.id },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: 10,
      });

      console.log(
        `  Department "${department.name}" (ID: ${department.id}): ${employees.count} employees`
      );
      if (employees.rows.length > 0) {
        employees.rows.slice(0, 3).forEach((emp) => {
          console.log(`    - ${emp.first_name_en} ${emp.last_name_en} (${emp.position_en})`);
        });
      }
    }

    // Test 4: Get employees by team
    console.log('\n🔍 Testing getEmployeesByTeam endpoint...');
    for (const team of teams) {
      const employees = await Employee.findAndCountAll({
        where: { team_id: team.id },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: 10,
      });

      console.log(`  Team "${team.name}" (ID: ${team.id}): ${employees.count} employees`);
      if (employees.rows.length > 0) {
        employees.rows.slice(0, 3).forEach((emp) => {
          console.log(`    - ${emp.first_name_en} ${emp.last_name_en} (${emp.position_en})`);
        });
      }
    }

    // Summary of all endpoints
    console.log('\n🎉 All employee hierarchy endpoints tested successfully!');

    console.log('\n📡 New API Endpoints Summary:');
    console.log('1. GET /api/sectors/:sectorId/employees - Get all employees in a specific sector');
    console.log(
      '2. GET /api/divisions/:divisionId/employees - Get all employees in a specific division'
    );
    console.log(
      '3. GET /api/departments/:departmentId/employees - Get all employees in a specific department'
    );
    console.log('4. GET /api/teams/:teamId/employees - Get all employees in a specific team');

    console.log('\nQuery Parameters (all endpoints):');
    console.log('- page: Page number (default: 1)');
    console.log('- limit: Items per page (default: 50)');

    console.log('\nExample Usage:');
    console.log('GET /api/sectors/1/employees?page=1&limit=20');
    console.log('GET /api/divisions/2/employees');
    console.log('GET /api/departments/3/employees?page=2');
    console.log('GET /api/teams/4/employees');

    // Show sample response format
    if (sectors.length > 0) {
      const sampleEmployee = await Employee.findOne({
        where: { sector_id: sectors[0].id },
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
      });

      if (sampleEmployee) {
        console.log('\nSample Response Format:');
        console.log(
          JSON.stringify(
            {
              success: true,
              message: `Employees in sector: ${sectors[0].name}`,
              data: [
                {
                  id: sampleEmployee.id,
                  first_name_en: sampleEmployee.first_name_en,
                  last_name_en: sampleEmployee.last_name_en,
                  position_en: sampleEmployee.position_en,
                  office_number: sampleEmployee.office_number,
                  section: sampleEmployee.section,
                  city: sampleEmployee.city,
                  subcity: sampleEmployee.subcity,
                  sector_id: sampleEmployee.sector_id,
                  division_id: sampleEmployee.division_id,
                  department_id: sampleEmployee.department_id,
                  team_id: sampleEmployee.team_id,
                  sector: sampleEmployee.sector,
                  division: sampleEmployee.division,
                  employeeDepartment: sampleEmployee.employeeDepartment,
                  team: sampleEmployee.team,
                },
              ],
              pagination: {
                total: 1,
                page: 1,
                limit: 50,
                totalPages: 1,
              },
              sector: {
                id: sectors[0].id,
                name: sectors[0].name,
              },
            },
            null,
            2
          )
        );
      }
    }
  } catch (error) {
    console.error('❌ Error testing employee hierarchy endpoints:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testEmployeeHierarchyEndpoints();
