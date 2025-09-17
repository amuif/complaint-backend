const { Sector, Division } = require('./models');
const { initDb } = require('./services/databaseService');

async function testDivisionsAPI() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Test the Division model directly
    console.log('\n📝 Testing Division model...');

    // First, ensure we have a test sector
    let testSector = await Sector.findOne({ where: { name: 'Test Sector' } });
    if (!testSector) {
      testSector = await Sector.create({ name: 'Test Sector' });
      console.log('✅ Test sector created');
    }

    // Create a test division
    const testDivision = await Division.create({
      name: 'Test Division',
      sector_id: testSector.id,
    });
    console.log('✅ Test division created:', testDivision.toJSON());

    // Test fetching all divisions with sector information
    console.log('\n📊 Testing getDivisions functionality...');
    const allDivisions = await Division.findAll({
      attributes: ['id', 'name', 'sector_id'],
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(`Found ${allDivisions.length} divisions:`);
    allDivisions.forEach((division) => {
      console.log(`  ID: ${division.id}, Name: ${division.name}, Sector: ${division.sector.name}`);
    });

    // Test fetching divisions by sector
    console.log('\n📊 Testing getDivisionsBySector functionality...');
    const divisionsBySector = await Division.findAll({
      where: { sector_id: testSector.id },
      attributes: ['id', 'name', 'sector_id'],
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name'],
        },
      ],
      order: [['name', 'ASC']],
    });

    console.log(`Found ${divisionsBySector.length} divisions for sector "${testSector.name}":`);
    divisionsBySector.forEach((division) => {
      console.log(`  ID: ${division.id}, Name: ${division.name}`);
    });

    // Clean up test data
    await testDivision.destroy();
    await testSector.destroy();
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 Division model test completed successfully!');

    console.log('\n📡 API Endpoints:');
    console.log('1. GET /api/divisions - Get all divisions');
    console.log('2. GET /api/sectors/:sectorId/divisions - Get divisions by sector');

    console.log('\nExpected Response Formats:');
    console.log('\n1. GET /api/divisions:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Administrative Services',
              sector_id: 1,
              sector: {
                id: 1,
                name: 'Public Administration',
              },
            },
          ],
        },
        null,
        2
      )
    );

    console.log('\n2. GET /api/sectors/1/divisions:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: [
            {
              id: 1,
              name: 'Administrative Services',
              sector_id: 1,
              sector: {
                id: 1,
                name: 'Public Administration',
              },
            },
          ],
          sector: {
            id: 1,
            name: 'Public Administration',
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Error testing divisions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testDivisionsAPI();
