/**
 * Simple Department Insertion Script
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'office_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function insertSimpleDepartments() {
  try {
    console.log('🚀 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Clear existing data
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.query('DELETE FROM employees WHERE 1=1');
    await sequelize.query('DELETE FROM offices WHERE 1=1');
    await sequelize.query('DELETE FROM departments WHERE 1=1');
    await sequelize.query('ALTER TABLE departments AUTO_INCREMENT = 1');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🗑️ Cleared existing data');

    // Insert departments
    const departments = [
      {
        name_en: 'Control & Awareness',
        name_am: 'ቁጥጥር እና ግንዛቤ',
        name_af: 'Tooftuu fi Hubannoo',
        code: 'CTRL_AWR',
        description_en:
          'Control and Awareness Department - Monitoring and public awareness services',
        description_am: 'የቁጥጥር እና ግንዛቤ መምሪያ - የክትትል እና የሕዝብ ግንዛቤ አገልግሎቶች',
        description_af: 'Kutaa Tooftuu fi Hubannoo - Tajaajila hordoffii fi hubannoo hawaasaa',
      },
      {
        name_en: 'Engineering',
        name_am: 'ምህንድስና',
        name_af: 'Injinarummaa',
        code: 'ENG',
        description_en: 'Engineering Department - Technical and infrastructure services',
        description_am: 'የምህንድስና መምሪያ - ቴክኒካል እና መሠረተ ልማት አገልግሎቶች',
        description_af: "Kutaa Injinarummaa - Tajaajila teeknikaa fi bu'uuraalee misoomaa",
      },
      {
        name_en: 'Support',
        name_am: 'ድጋፍ',
        name_af: 'Deeggarsa',
        code: 'SUPP',
        description_en: 'Support Department - Administrative and operational support services',
        description_am: 'የድጋፍ መምሪያ - የአስተዳደር እና የአሠራር ድጋፍ አገልግሎቶች',
        description_af: 'Kutaa Deeggarsa - Tajaajila deeggarsa bulchiinsaa fi hojii',
      },
      {
        name_en: 'Control Center',
        name_am: 'የቁጥጥር ማዕከል',
        name_af: 'Giddugala Tooftuu',
        code: 'CTRL_CTR',
        description_en: 'Control Center Department - Central monitoring and coordination services',
        description_am: 'የቁጥጥር ማዕከል መምሪያ - ማዕከላዊ ክትትል እና ቅንጅት አገልግሎቶች',
        description_af: 'Kutaa Giddugala Tooftuu - Tajaajila hordoffii fi qindoomina giddugalaa',
      },
    ];

    for (const dept of departments) {
      await sequelize.query(
        'INSERT INTO departments (name_en, name_am, name_af, code, description_en, description_am, description_af, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        {
          replacements: [
            dept.name_en,
            dept.name_am,
            dept.name_af,
            dept.code,
            dept.description_en,
            dept.description_am,
            dept.description_af,
          ],
        }
      );
      console.log(`✅ Inserted department: ${dept.name_en}`);
    }

    // Insert basic offices
    const offices = [
      {
        name: 'Control & Awareness Office',
        name_amharic: 'የቁጥጥር እና ግንዛቤ ቢሮ',
        name_afan_oromo: 'Waajjira Tooftuu fi Hubannoo',
        office_number: 'CA-101',
        department_id: 1,
        description: 'Main office for control and awareness operations',
        floor: '1st Floor',
        location: 'Building A, Room 101',
        phone: '+251911200001',
        email: 'ca.office@office.gov.et',
        services_offered: 'Monitoring, Public awareness, Compliance checking',
        opening_hours: '8:00 AM - 5:00 PM',
      },
      {
        name: 'Engineering Office',
        name_amharic: 'የምህንድስና ቢሮ',
        name_afan_oromo: 'Waajjira Injinarummaa',
        office_number: 'ENG-201',
        department_id: 2,
        description: 'Engineering services office',
        floor: '2nd Floor',
        location: 'Building B, Room 201',
        phone: '+251911200002',
        email: 'eng.office@office.gov.et',
        services_offered: 'Technical consultations, Infrastructure planning, Project approvals',
        opening_hours: '8:00 AM - 5:00 PM',
      },
      {
        name: 'Support Office',
        name_amharic: 'የድጋፍ ቢሮ',
        name_afan_oromo: 'Waajjira Deeggarsa',
        office_number: 'SUP-301',
        department_id: 3,
        description: 'Support services office',
        floor: '3rd Floor',
        location: 'Building C, Room 301',
        phone: '+251911200003',
        email: 'support.office@office.gov.et',
        services_offered: 'Administrative support, Document processing, General inquiries',
        opening_hours: '8:00 AM - 5:00 PM',
      },
      {
        name: 'Control Center',
        name_amharic: 'የቁጥጥር ማዕከል',
        name_afan_oromo: 'Giddugala Tooftuu',
        office_number: 'CC-401',
        department_id: 4,
        description: 'Central control operations',
        floor: '4th Floor',
        location: 'Building D, Room 401',
        phone: '+251911200004',
        email: 'control.ops@office.gov.et',
        services_offered: 'Central monitoring, Coordination, Emergency response',
        opening_hours: '24/7',
      },
    ];

    for (const office of offices) {
      await sequelize.query(
        'INSERT INTO offices (name, name_amharic, name_afan_oromo, office_number, department_id, description, floor, location, phone, email, services_offered, opening_hours, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
        {
          replacements: [
            office.name,
            office.name_amharic,
            office.name_afan_oromo,
            office.office_number,
            office.department_id,
            office.description,
            office.floor,
            office.location,
            office.phone,
            office.email,
            office.services_offered,
            office.opening_hours,
          ],
        }
      );
      console.log(`✅ Inserted office: ${office.name}`);
    }

    // Verify insertion
    const [deptResult] = await sequelize.query('SELECT COUNT(*) as count FROM departments');
    const [officeResult] = await sequelize.query('SELECT COUNT(*) as count FROM offices');

    console.log('\n🎉 Successfully inserted data!');
    console.log('📊 Summary:');
    console.log(`   • Departments: ${deptResult[0].count}`);
    console.log(`   • Offices: ${officeResult[0].count}`);
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  insertSimpleDepartments()
    .then(() => {
      console.log('\n✅ Department insertion completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Failed:', error.message);
      process.exit(1);
    });
}

module.exports = { insertSimpleDepartments };
