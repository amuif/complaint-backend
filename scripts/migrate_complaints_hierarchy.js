/**
 * =====================================
 * MIGRATE COMPLAINTS TO INCLUDE ORGANIZATIONAL HIERARCHY
 * =====================================
 * This script adds sector_id, division_id, department_id, team_id columns
 * to both complaints and public_complaints tables and updates existing records
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'office_management',
  charset: 'utf8mb4',
};

async function migrateComplaintsHierarchy() {
  let connection;

  try {
    console.log('🚀 Starting complaints hierarchy migration...');

    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // =====================================
    // 1. ADD HIERARCHY COLUMNS TO COMPLAINTS TABLE
    // =====================================

    console.log('📊 Adding hierarchy columns to complaints table...');

    // Check if columns already exist
    const [complaintsColumns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'complaints'
    `,
      [DB_CONFIG.database]
    );

    const existingComplaintsCols = complaintsColumns.map((row) => row.COLUMN_NAME);

    if (!existingComplaintsCols.includes('sector_id')) {
      await connection.execute(`
        ALTER TABLE complaints 
        ADD COLUMN sector_id INT NULL COMMENT 'Reference to organizational sector',
        ADD COLUMN division_id INT NULL COMMENT 'Reference to organizational division',
        ADD COLUMN department_id INT NULL COMMENT 'Reference to organizational department (new hierarchy)',
        ADD COLUMN team_id INT NULL COMMENT 'Reference to organizational team'
      `);
      console.log('✅ Added hierarchy columns to complaints table');
    } else {
      console.log('ℹ️ Hierarchy columns already exist in complaints table');
    }

    // Add foreign key constraints for complaints (with error handling)
    console.log('🔗 Adding foreign key constraints to complaints table...');

    try {
      await connection.execute(`
        ALTER TABLE complaints
        ADD CONSTRAINT fk_complaints_sector 
            FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('ℹ️ Foreign key fk_complaints_sector may already exist');
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints
        ADD CONSTRAINT fk_complaints_division 
            FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('ℹ️ Foreign key fk_complaints_division may already exist');
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints
        ADD CONSTRAINT fk_complaints_department_hierarchy 
            FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('ℹ️ Foreign key fk_complaints_department_hierarchy may already exist');
      }
    }

    try {
      await connection.execute(`
        ALTER TABLE complaints
        ADD CONSTRAINT fk_complaints_team 
            FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
      `);
    } catch (error) {
      if (!error.message.includes('Duplicate key name')) {
        console.log('ℹ️ Foreign key fk_complaints_team may already exist');
      }
    }

    // Add indexes for better query performance
    console.log('📈 Adding indexes to complaints table...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_complaints_sector ON complaints(sector_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_division ON complaints(division_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_department_hierarchy ON complaints(department_id)',
      'CREATE INDEX IF NOT EXISTS idx_complaints_team ON complaints(team_id)',
    ];

    for (const indexQuery of indexes) {
      try {
        await connection.execute(indexQuery);
      } catch (error) {
        console.log(`ℹ️ Index may already exist: ${error.message}`);
      }
    }

    // =====================================
    // 2. ADD HIERARCHY COLUMNS TO PUBLIC_COMPLAINTS TABLE
    // =====================================

    console.log('📊 Adding hierarchy columns to public_complaints table...');

    // Check if columns already exist
    const [publicComplaintsColumns] = await connection.execute(
      `
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'public_complaints'
    `,
      [DB_CONFIG.database]
    );

    const existingPublicComplaintsCols = publicComplaintsColumns.map((row) => row.COLUMN_NAME);

    if (!existingPublicComplaintsCols.includes('sector_id')) {
      await connection.execute(`
        ALTER TABLE public_complaints 
        ADD COLUMN sector_id INT NULL COMMENT 'Reference to organizational sector',
        ADD COLUMN division_id INT NULL COMMENT 'Reference to organizational division',
        ADD COLUMN department_id INT NULL COMMENT 'Reference to organizational department (new hierarchy)',
        ADD COLUMN team_id INT NULL COMMENT 'Reference to organizational team'
      `);
      console.log('✅ Added hierarchy columns to public_complaints table');
    } else {
      console.log('ℹ️ Hierarchy columns already exist in public_complaints table');
    }

    // Add foreign key constraints for public_complaints (with error handling)
    console.log('🔗 Adding foreign key constraints to public_complaints table...');

    const publicComplaintsFKs = [
      {
        name: 'fk_public_complaints_sector',
        query:
          'ALTER TABLE public_complaints ADD CONSTRAINT fk_public_complaints_sector FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL',
      },
      {
        name: 'fk_public_complaints_division',
        query:
          'ALTER TABLE public_complaints ADD CONSTRAINT fk_public_complaints_division FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL',
      },
      {
        name: 'fk_public_complaints_department_hierarchy',
        query:
          'ALTER TABLE public_complaints ADD CONSTRAINT fk_public_complaints_department_hierarchy FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL',
      },
      {
        name: 'fk_public_complaints_team',
        query:
          'ALTER TABLE public_complaints ADD CONSTRAINT fk_public_complaints_team FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL',
      },
    ];

    for (const fk of publicComplaintsFKs) {
      try {
        await connection.execute(fk.query);
      } catch (error) {
        if (!error.message.includes('Duplicate key name')) {
          console.log(`ℹ️ Foreign key ${fk.name} may already exist`);
        }
      }
    }

    // Add indexes for better query performance
    console.log('📈 Adding indexes to public_complaints table...');

    const publicIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_public_complaints_sector ON public_complaints(sector_id)',
      'CREATE INDEX IF NOT EXISTS idx_public_complaints_division ON public_complaints(division_id)',
      'CREATE INDEX IF NOT EXISTS idx_public_complaints_department_hierarchy ON public_complaints(department_id)',
      'CREATE INDEX IF NOT EXISTS idx_public_complaints_team ON public_complaints(team_id)',
    ];

    for (const indexQuery of publicIndexes) {
      try {
        await connection.execute(indexQuery);
      } catch (error) {
        console.log(`ℹ️ Index may already exist: ${error.message}`);
      }
    }

    // =====================================
    // 3. UPDATE EXISTING COMPLAINTS WITH SAMPLE HIERARCHY DATA
    // =====================================

    console.log('🔄 Updating existing complaints with hierarchy assignments...');

    // Check if we have organizational hierarchy data
    const [sectorCount] = await connection.execute('SELECT COUNT(*) as count FROM sectors');

    if (sectorCount[0].count > 0) {
      // Update existing complaints with sample organizational hierarchy assignments
      const updateQueries = [
        'UPDATE complaints SET sector_id = 1, division_id = 1, department_id = 1, team_id = 1 WHERE id % 4 = 1 AND sector_id IS NULL',
        'UPDATE complaints SET sector_id = 2, division_id = 4, department_id = 7, team_id = NULL WHERE id % 4 = 2 AND sector_id IS NULL',
        'UPDATE complaints SET sector_id = 3, division_id = 6, department_id = 11, team_id = NULL WHERE id % 4 = 3 AND sector_id IS NULL',
        'UPDATE complaints SET sector_id = 4, division_id = 8, department_id = NULL, team_id = NULL WHERE id % 4 = 0 AND sector_id IS NULL',
      ];

      for (const query of updateQueries) {
        try {
          const [result] = await connection.execute(query);
          console.log(`✅ Updated ${result.affectedRows} complaints`);
        } catch (error) {
          console.log(`ℹ️ Update query may have failed: ${error.message}`);
        }
      }

      // Update existing public complaints
      const publicUpdateQueries = [
        'UPDATE public_complaints SET sector_id = 1, division_id = 2, department_id = 3, team_id = 6 WHERE id % 4 = 1 AND sector_id IS NULL',
        'UPDATE public_complaints SET sector_id = 2, division_id = 5, department_id = 8, team_id = NULL WHERE id % 4 = 2 AND sector_id IS NULL',
        'UPDATE public_complaints SET sector_id = 3, division_id = 7, department_id = 13, team_id = NULL WHERE id % 4 = 3 AND sector_id IS NULL',
        'UPDATE public_complaints SET sector_id = 4, division_id = 9, department_id = NULL, team_id = NULL WHERE id % 4 = 0 AND sector_id IS NULL',
      ];

      for (const query of publicUpdateQueries) {
        try {
          const [result] = await connection.execute(query);
          console.log(`✅ Updated ${result.affectedRows} public complaints`);
        } catch (error) {
          console.log(`ℹ️ Public update query may have failed: ${error.message}`);
        }
      }
    } else {
      console.log(
        '⚠️ No organizational hierarchy data found. Please run the hierarchy insertion script first.'
      );
    }

    // =====================================
    // 4. VERIFICATION
    // =====================================

    console.log('🔍 Verifying migration results...');

    // Check the updated table structures
    const [complaintsInfo] = await connection.execute(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(sector_id) as with_sector,
        COUNT(division_id) as with_division,
        COUNT(department_id) as with_department,
        COUNT(team_id) as with_team
      FROM complaints
    `);

    const [publicComplaintsInfo] = await connection.execute(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(sector_id) as with_sector,
        COUNT(division_id) as with_division,
        COUNT(department_id) as with_department,
        COUNT(team_id) as with_team
      FROM public_complaints
    `);

    console.log('\n📊 Migration Summary:');
    console.log('===================');
    console.log('COMPLAINTS TABLE:');
    console.log(`  Total complaints: ${complaintsInfo[0].total_complaints}`);
    console.log(`  With sector: ${complaintsInfo[0].with_sector}`);
    console.log(`  With division: ${complaintsInfo[0].with_division}`);
    console.log(`  With department: ${complaintsInfo[0].with_department}`);
    console.log(`  With team: ${complaintsInfo[0].with_team}`);

    console.log('\nPUBLIC COMPLAINTS TABLE:');
    console.log(`  Total complaints: ${publicComplaintsInfo[0].total_complaints}`);
    console.log(`  With sector: ${publicComplaintsInfo[0].with_sector}`);
    console.log(`  With division: ${publicComplaintsInfo[0].with_division}`);
    console.log(`  With department: ${publicComplaintsInfo[0].with_department}`);
    console.log(`  With team: ${publicComplaintsInfo[0].with_team}`);

    console.log('\n🎉 Complaints hierarchy migration completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Test complaint creation with hierarchy fields');
    console.log('2. Update your frontend forms to include hierarchy selection');
    console.log('3. Create complaint filtering endpoints by hierarchy levels');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the migration
if (require.main === module) {
  migrateComplaintsHierarchy()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateComplaintsHierarchy };
