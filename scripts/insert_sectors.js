const { Sector } = require('../models');
const { initDb } = require('../services/databaseService');

const sampleSectors = [
  { name: 'Public Administration' },
  { name: 'Health Services' },
  { name: 'Education' },
  { name: 'Transportation' },
  { name: 'Social Services' },
  { name: 'Urban Planning' },
  { name: 'Finance and Revenue' },
  { name: 'Legal Affairs' },
  { name: 'Information Technology' },
  { name: 'Human Resources' },
];

async function insertSectors() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Check if sectors already exist
    const existingSectors = await Sector.findAll();
    if (existingSectors.length > 0) {
      console.log('ℹ️  Sectors already exist in database');
      console.log(`Found ${existingSectors.length} existing sectors:`);
      existingSectors.forEach((sector) => {
        console.log(`  - ${sector.name}`);
      });
      return;
    }

    // Insert sample sectors
    console.log('📝 Inserting sample sectors...');

    for (const sectorData of sampleSectors) {
      await Sector.create(sectorData);
      console.log(`✅ Created sector: ${sectorData.name}`);
    }

    console.log('🎉 All sectors inserted successfully!');

    // Verify insertion
    const totalSectors = await Sector.count();
    console.log(`📊 Total sectors in database: ${totalSectors}`);
  } catch (error) {
    console.error('❌ Error inserting sectors:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
insertSectors();
