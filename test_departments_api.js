const { Sector, Division, Department } = require('./models');
const { initDb } = require('./services/databaseService');

async function testDepartmentsAPI() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Test the Department model directly
    console.log('\n📝 Testing Department model...');

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

    // Create a test department
    const testDepartment = await Department.create({
      name: 'Test Department',
      division_id: testDivision.id,
    });
    console.log('✅ Test department created:', testDepartment.toJSON());

    // Test fetching all departments with division and sector information
    console.log('\n📊 Testing getDepartments functionality...');
    const allDepartments = await Department.findAll({
      attributes: ['id', 'name', 'division_id'],
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name'],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name_en', 'name_am', 'name_af'],
            },
          ],
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(`Found ${allDepartments.length} departments:`);
    allDepartments.forEach((department) => {
      console.log(`  ID: ${department.id}, Name: ${department.name}`);
      console.log(`    Division: ${department.division.name}`);
      console.log(`    Sector: ${department.division.sector.name}`);
    });

    // Test fetching departments by division
    console.log('\n📊 Testing getDepartmentsByDivision functionality...');
    const departmentsByDivision = await Department.findAll({
      where: { division_id: testDivision.id },
      attributes: ['id', 'name', 'division_id'],
      include: [
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name'],
          include: [
            {
              model: Sector,
              as: 'sector',
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(
      `Found ${departmentsByDivision.length} departments for division "${testDivision.name}":`
    );
    departmentsByDivision.forEach((department) => {
      console.log(`  ID: ${department.id}, Name: ${department.name}`);
    });

    // Clean up test data
    await testDepartment.destroy();
    await testDivision.destroy();
    await testSector.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Department model test completed successfully!');

    console.log('\n📡 API Endpoints:');
    console.log('1. GET /api/departments - Get all departments');
    console.log('2. GET /api/divisions/:divisionId/departments - Get departments by division');

    console.log('\nExpected Response Formats:');
    console.log('\n1. GET /api/departments:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Human Resources',
              division_id: 1,
              division: {
                id: 1,
                name: 'Administrative Services',
                sector: {
                  id: 1,
                  name: 'Public Administration',
                },
              },
            },
          ],
        },
        null,
        2
      )
    );

    console.log('\n2. GET /api/divisions/1/departments:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Human Resources',
              division_id: 1,
              division: {
                id: 1,
                name: 'Administrative Services',
                sector: {
                  id: 1,
                  name: 'Public Administration',
                },
              },
            },
          ],
          division: {
            id: 1,
            name: 'Administrative Services',
            sector: {
              id: 1,
              name: 'Public Administration',
            },
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Error testing departments:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testDepartmentsAPI();
