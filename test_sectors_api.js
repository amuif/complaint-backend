const { Sector } = require('./models');
const { initDb } = require('./services/databaseService');

async function testSectorsAPI() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Test the Sector model directly
    console.log('\n📝 Testing Sector model...');

    // Create a test sector
    const testSector = await Sector.create({
      name: 'Test Sector',
    });
    console.log('✅ Test sector created:', testSector.toJSON());

    // Fetch all sectors
    const allSectors = await Sector.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });

    console.log('\n📊 All sectors in database:');
    allSectors.forEach((sector) => {
      console.log(`  ID: ${sector.id}, Name: ${sector.name}`);
    });

    // Clean up test data
    await testSector.destroy();
    console.log('✅ Test sector cleaned up');

    console.log('\n🎉 Sector model test completed successfully!');
    console.log('\n📡 API Endpoint: GET /api/sectors');
    console.log('Expected Response Format:');
    console.log(
      JSON.stringify(
        {
          success: true,
          data: allSectors.map((s) => ({ id: s.id, name: s.name })),
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error('❌ Error testing sectors:', error);
  } finally {
    process.exit(0);
  }
}

// Run the test
testSectorsAPI();
