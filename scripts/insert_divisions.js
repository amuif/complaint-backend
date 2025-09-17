const { Sector, Division } = require('../models');
const { initDb } = require('../services/databaseService');

const sampleDivisions = [
  // Public Administration divisions
  { name: 'Administrative Services', sectorName: 'Public Administration' },
  { name: 'Policy Development', sectorName: 'Public Administration' },
  { name: 'Public Relations', sectorName: 'Public Administration' },

  // Health Services divisions
  { name: 'Primary Healthcare', sectorName: 'Health Services' },
  { name: 'Emergency Services', sectorName: 'Health Services' },
  { name: 'Public Health', sectorName: 'Health Services' },

  // Education divisions
  { name: 'Primary Education', sectorName: 'Education' },
  { name: 'Secondary Education', sectorName: 'Education' },
  { name: 'Adult Education', sectorName: 'Education' },

  // Transportation divisions
  { name: 'Public Transit', sectorName: 'Transportation' },
  { name: 'Traffic Management', sectorName: 'Transportation' },
  { name: 'Road Maintenance', sectorName: 'Transportation' },

  // Social Services divisions
  { name: 'Community Development', sectorName: 'Social Services' },
  { name: 'Social Welfare', sectorName: 'Social Services' },
  { name: 'Youth Services', sectorName: 'Social Services' },

  // Urban Planning divisions
  { name: 'City Planning', sectorName: 'Urban Planning' },
  { name: 'Zoning', sectorName: 'Urban Planning' },
  { name: 'Building Permits', sectorName: 'Urban Planning' },

  // Finance and Revenue divisions
  { name: 'Tax Collection', sectorName: 'Finance and Revenue' },
  { name: 'Budget Planning', sectorName: 'Finance and Revenue' },
  { name: 'Financial Audit', sectorName: 'Finance and Revenue' },

  // Legal Affairs divisions
  { name: 'Legal Counsel', sectorName: 'Legal Affairs' },
  { name: 'Contract Management', sectorName: 'Legal Affairs' },
  { name: 'Compliance', sectorName: 'Legal Affairs' },

  // Information Technology divisions
  { name: 'System Administration', sectorName: 'Information Technology' },
  { name: 'Software Development', sectorName: 'Information Technology' },
  { name: 'IT Support', sectorName: 'Information Technology' },

  // Human Resources divisions
  { name: 'Recruitment', sectorName: 'Human Resources' },
  { name: 'Training and Development', sectorName: 'Human Resources' },
  { name: 'Employee Relations', sectorName: 'Human Resources' },
];

async function insertDivisions() {
  try {
    // Initialize database connection
    await initDb();
    console.log('✅ Database connected successfully');

    // Check if divisions already exist
    const existingDivisions = await Division.findAll();
    if (existingDivisions.length > 0) {
      console.log('ℹ️  Divisions already exist in database');
      console.log(`Found ${existingDivisions.length} existing divisions`);
      return;
    }

    // Get all sectors to map names to IDs
    const sectors = await Sector.findAll();
    if (sectors.length === 0) {
      console.log('❌ No sectors found. Please run insert_sectors.js first');
      return;
    }

    const sectorMap = {};
    sectors.forEach((sector) => {
      sectorMap[sector.name] = sector.id;
    });

    console.log('📝 Inserting sample divisions...');

    let insertedCount = 0;
    for (const divisionData of sampleDivisions) {
      const sectorId = sectorMap[divisionData.sectorName];

      if (!sectorId) {
        console.log(
          `⚠️  Sector '${divisionData.sectorName}' not found, skipping division '${divisionData.name}'`
        );
        continue;
      }

      await Division.create({
        name: divisionData.name,
        sector_id: sectorId,
      });

      console.log(`✅ Created division: ${divisionData.name} (Sector: ${divisionData.sectorName})`);
      insertedCount++;
    }

    console.log(`🎉 ${insertedCount} divisions inserted successfully!`);

    // Verify insertion
    const totalDivisions = await Division.count();
    console.log(`📊 Total divisions in database: ${totalDivisions}`);

    // Show divisions by sector
    console.log('\n📋 Divisions by Sector:');
    for (const sector of sectors) {
      const divisionsInSector = await Division.findAll({
        where: { sector_id: sector.id },
        order: [['name', 'ASC']],
      });

      console.log(`\n${sector.name} (${divisionsInSector.length} divisions):`);
      divisionsInSector.forEach((division) => {
        console.log(`  - ${division.name}`);
      });
    }
  } catch (error) {
    console.error('❌ Error inserting divisions:', error);
  } finally {
    process.exit(0);
  }
}

// Run the script
insertDivisions();
