const { Sector, Division, Department, Team } = require('./models');
const { initDb } = require('./services/databaseService');

async function testTeamsAPI() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Test the Team model directly
    console.log('\n📝 Testing Team model...');

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

    // Create a test team
    const testTeam = await Team.create({
      name: 'Test Team',
      department_id: testDepartment.id,
    });
    console.log('✅ Test team created:', testTeam.toJSON());

    // Test fetching all teams with complete hierarchy information
    console.log('\n📊 Testing getTeams functionality...');
    const allTeams = await Team.findAll({
      attributes: ['id', 'name', 'department_id'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
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
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(`Found ${allTeams.length} teams:`);
    allTeams.forEach((team) => {
      console.log(`  ID: ${team.id}, Name: ${team.name}`);
      console.log(`    Department: ${team.department.name}`);
      console.log(`    Division: ${team.department.division.name}`);
      console.log(`    Sector: ${team.department.division.sector.name}`);
    });

    // Test fetching teams by department
    console.log('\n📊 Testing getTeamsByDepartment functionality...');
    const teamsByDepartment = await Team.findAll({
      where: { department_id: testDepartment.id },
      attributes: ['id', 'name', 'department_id'],
      include: [
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name'],
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
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(`Found ${teamsByDepartment.length} teams for department "${testDepartment.name}":`);
    teamsByDepartment.forEach((team) => {
      console.log(`  ID: ${team.id}, Name: ${team.name}`);
    });

    // Clean up test data
    await testTeam.destroy();
    await testDepartment.destroy();
    await testDivision.destroy();
    await testSector.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Team model test completed successfully!');

    console.log('\n📡 API Endpoints:');
    console.log('1. GET /api/teams - Get all teams');
    console.log('2. GET /api/departments/:departmentId/teams - Get teams by department');

    console.log('\nExpected Response Formats:');
    console.log('\n1. GET /api/teams:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Recruitment Team',
              department_id: 1,
              department: {
                id: 1,
                name: 'Human Resources',
                division: {
                  id: 1,
                  name: 'Administrative Services',
                  sector: {
                    id: 1,
                    name: 'Public Administration',
                  },
                },
              },
            },
          ],
        },
        null,
        2
      )
    );

    console.log('\n2. GET /api/departments/1/teams:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Recruitment Team',
              department_id: 1,
              department: {
                id: 1,
                name: 'Human Resources',
                division: {
                  id: 1,
                  name: 'Administrative Services',
                  sector: {
                    id: 1,
                    name: 'Public Administration',
                  },
                },
              },
            },
          ],
          department: {
            id: 1,
            name: 'Human Resources',
            division: {
              id: 1,
              name: 'Administrative Services',
              sector: {
                id: 1,
                name: 'Public Administration',
              },
            },
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Error testing teams:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testTeamsAPI();
