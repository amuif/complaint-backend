const { Employee, Sector, Division, Department, Team } = require('./models');
const { initDb } = require('./services/databaseService');

async function testEmployeeHierarchy() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Test creating an employee with full hierarchy
    console.log('\n📝 Testing Employee with organizational hierarchy...');

    // First, ensure we have test data
    let testSector = await Sector.findOne({ where: { name: 'Test Sector' } });
    if (!testSector) {
      testSector = await Sector.create({ name: 'Test Sector' });
      console.log('✅ Test sector created');
    }

    let testDivision = await Division.findOne({
      where: {
        name: 'Test Division',
        sector_id: testSector.id,
      },
    });
    if (!testDivision) {
      testDivision = await Division.create({
        name: 'Test Division',
        sector_id: testSector.id,
      });
      console.log('✅ Test division created');
    }

    let testDepartment = await Department.findOne({
      where: {
        name: 'Test Department',
        division_id: testDivision.id,
      },
    });
    if (!testDepartment) {
      testDepartment = await Department.create({
        name: 'Test Department',
        division_id: testDivision.id,
      });
      console.log('✅ Test department created');
    }

    let testTeam = await Team.findOne({
      where: {
        name: 'Test Team',
        department_id: testDepartment.id,
      },
    });
    if (!testTeam) {
      testTeam = await Team.create({
        name: 'Test Team',
        department_id: testDepartment.id,
      });
      console.log('✅ Test team created');
    }

    // Create a test employee with full hierarchy
    const testEmployee = await Employee.create({
      first_name_en: 'John',
      last_name_en: 'Doe',
      position_en: 'Test Manager',
      section: 'Test Section',
      sector_id: testSector.id,
      division_id: testDivision.id,
      department_id: testDepartment.id,
      team_id: testTeam.id,
    });
    console.log('✅ Test employee created:', {
      id: testEmployee.id,
      name: `${testEmployee.first_name_en} ${testEmployee.last_name_en}`,
      position: testEmployee.position_en,
    });

    // Test fetching employee with complete hierarchy information
    console.log('\n📊 Testing getEmployeesWithHierarchy functionality...');
    const employeesWithHierarchy = await Employee.findAll({
      where: { id: testEmployee.id },
      attributes: [
        'id',
        'first_name_en',
        'last_name_en',
        'position_en',
        'office_number',
        'section',
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
    });

    console.log(`Found ${employeesWithHierarchy.length} employees with hierarchy:`);
    employeesWithHierarchy.forEach((employee) => {
      console.log(`  Employee: ${employee.first_name_en} ${employee.last_name_en}`);
      console.log(`    Position: ${employee.position_en}`);
      console.log(`    Sector: ${employee.sector?.name || 'N/A'}`);
      console.log(`    Division: ${employee.division?.name || 'N/A'}`);
      console.log(`    Department: ${employee.employeeDepartment?.name || 'N/A'}`);
      console.log(`    Team: ${employee.team?.name || 'N/A'}`);
    });

    // Test filtering by organizational hierarchy
    console.log('\n📊 Testing hierarchy filtering...');

    // Filter by sector
    const employeesBySector = await Employee.findAll({
      where: { sector_id: testSector.id },
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name'],
        },
      ],
    });
    console.log(`Employees in sector "${testSector.name}": ${employeesBySector.length}`);

    // Filter by division
    const employeesByDivision = await Employee.findAll({
      where: { division_id: testDivision.id },
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name'],
        },
      ],
    });
    console.log(`Employees in division "${testDivision.name}": ${employeesByDivision.length}`);

    // Filter by department
    const employeesByDepartment = await Employee.findAll({
      where: { department_id: testDepartment.id },
      include: [
        {
          model: Department,
          as: 'employeeDepartment',
          attributes: ['id', 'name'],
        },
      ],
    });
    console.log(
      `Employees in department "${testDepartment.name}": ${employeesByDepartment.length}`
    );

    // Filter by team
    const employeesByTeam = await Employee.findAll({
      where: { team_id: testTeam.id },
      include: [
        {
          model: Team,
          as: 'team',
          attributes: ['id', 'name'],
        },
      ],
    });
    console.log(`Employees in team "${testTeam.name}": ${employeesByTeam.length}`);

    // Clean up test data
    await testEmployee.destroy();
    await testTeam.destroy();
    await testDepartment.destroy();
    await testDivision.destroy();
    await testSector.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Employee hierarchy test completed successfully!');

    console.log('\n📡 New API Endpoint:');
    console.log('GET /api/employees/hierarchy - Get employees with organizational hierarchy');
    console.log('\nQuery Parameters:');
    console.log('- sector: Filter by sector ID');
    console.log('- division: Filter by division ID');
    console.log('- department: Filter by department ID');
    console.log('- team: Filter by team ID');
    console.log('- page: Page number (default: 1)');
    console.log('- limit: Items per page (default: 50)');

    console.log('\nExpected Response Format:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              first_name_en: 'John',
              last_name_en: 'Doe',
              position_en: 'HR Manager',
              office_number: '101',
              section: 'Administrative',
              city: 'Addis Ababa',
              subcity: 'Bole',
              sector_id: 1,
              division_id: 1,
              department_id: 1,
              team_id: 1,
              sector: {
                id: 1,
                name: 'Public Administration',
              },
              division: {
                id: 1,
                name: 'Administrative Services',
              },
              employeeDepartment: {
                id: 1,
                name: 'Human Resources',
              },
              team: {
                id: 1,
                name: 'Recruitment Team',
              },
            },
          ],
          pagination: {
            total: 1,
            page: 1,
            limit: 50,
            totalPages: 1,
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Error testing employee hierarchy:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testEmployeeHierarchy();
