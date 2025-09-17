/**
 * Insert Departments Script
 * Inserts the specific departments requested for the office management system
 */

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Database configuration
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

const departments = [
  {
    name_en: 'Control & Awareness',
    name_am: 'ቁጥጥር እና ግንዛቤ',
    name_af: 'Tooftuu fi Hubannoo',
    code: 'CTRL_AWR',
    description_en: 'Control and Awareness Department - Monitoring and public awareness services',
    description_am: 'የቁጥጥር እና ግንዛቤ መምሪያ - የክትትል እና የሕዝብ ግንዛቤ አገልግሎቶች',
    description_af: 'Kutaa Tooftuu fi Hubannoo - Tajaajila hordoffii fi hubannoo hawaasaa',
    contact_email: 'control.awareness@office.gov.et',
    contact_phone: '+251911100001',
    head_name: 'Ato Bekele Mekonnen',
    is_active: true,
  },
  {
    name_en: 'Engineering',
    name_am: 'ምህንድስና',
    name_af: 'Injinarummaa',
    code: 'ENG',
    description_en: 'Engineering Department - Technical and infrastructure services',
    description_am: 'የምህንድስና መምሪያ - ቴክኒካል እና መሠረተ ልማት አገልግሎቶች',
    description_af: "Kutaa Injinarummaa - Tajaajila teeknikaa fi bu'uuraalee misoomaa",
    contact_email: 'engineering@office.gov.et',
    contact_phone: '+251911100002',
    head_name: 'Eng. Almaz Tadesse',
    is_active: true,
  },
  {
    name_en: 'Support',
    name_am: 'ድጋፍ',
    name_af: 'Deeggarsa',
    code: 'SUPP',
    description_en: 'Support Department - Administrative and operational support services',
    description_am: 'የድጋፍ መምሪያ - የአስተዳደር እና የአሠራር ድጋፍ አገልግሎቶች',
    description_af: 'Kutaa Deeggarsa - Tajaajila deeggarsa bulchiinsaa fi hojii',
    contact_email: 'support@office.gov.et',
    contact_phone: '+251911100003',
    head_name: 'W/ro Hanan Ahmed',
    is_active: true,
  },
  {
    name_en: 'Control Center',
    name_am: 'የቁጥጥር ማዕከል',
    name_af: 'Giddugala Tooftuu',
    code: 'CTRL_CTR',
    description_en: 'Control Center Department - Central monitoring and coordination services',
    description_am: 'የቁጥጥር ማዕከል መምሪያ - ማዕከላዊ ክትትል እና ቅንጅት አገልግሎቶች',
    description_af: 'Kutaa Giddugala Tooftuu - Tajaajila hordoffii fi qindoomina giddugalaa',
    contact_email: 'control.center@office.gov.et',
    contact_phone: '+251911100004',
    head_name: 'Ato Dawit Kebede',
    is_active: true,
  },
];

async function insertDepartments() {
  try {
    console.log('🚀 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Clear existing data in order (to handle foreign key constraints)
    await sequelize.query('DELETE FROM employees WHERE 1=1');
    await sequelize.query('DELETE FROM offices WHERE 1=1');
    await sequelize.query('DELETE FROM departments WHERE 1=1');
    console.log('🗑️ Cleared existing data');

    // Reset auto increments
    await sequelize.query('ALTER TABLE departments AUTO_INCREMENT = 1');
    await sequelize.query('ALTER TABLE offices AUTO_INCREMENT = 1');
    await sequelize.query('ALTER TABLE employees AUTO_INCREMENT = 1');

    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Insert new departments
    const insertQuery = `
      INSERT INTO departments (
        name_en, name_am, name_af, code, description_en, description_am, description_af, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    for (const dept of departments) {
      await sequelize.query(insertQuery, {
        replacements: [
          dept.name_en,
          dept.name_am,
          dept.name_af,
          dept.code,
          dept.description_en,
          dept.description_am,
          dept.description_af,
        ],
      });
      console.log(`✅ Inserted department: ${dept.name_en}`);
    }

    // Insert offices for each department
    const offices = [
      {
        name: 'Control & Awareness Main Office',
        name_amharic: 'የቁጥጥር እና ግንዛቤ ዋና ቢሮ',
        name_afan_oromo: 'Waajjira Guddaa Tooftuu fi Hubannoo',
        office_number: 'CA-101',
        department_id: 1,
        description: 'Main office for control and awareness operations',
        floor: '1st Floor',
        location: 'Building A, Room 101',
        phone: '+251911200001',
        email: 'ca.office@office.gov.et',
        services_offered: 'Monitoring services, Public awareness campaigns, Compliance checking',
      },
      {
        name: 'Engineering Main Office',
        name_amharic: 'የምህንድስና ዋና ቢሮ',
        name_afan_oromo: 'Waajjira Guddaa Injinarummaa',
        office_number: 'ENG-201',
        department_id: 2,
        description: 'Main office for engineering services',
        floor: '2nd Floor',
        location: 'Building B, Room 201',
        phone: '+251911200002',
        email: 'eng.office@office.gov.et',
        services_offered: 'Technical consultations, Infrastructure planning, Project approvals',
      },
      {
        name: 'Support Services Office',
        name_amharic: 'የድጋፍ አገልግሎት ቢሮ',
        name_afan_oromo: 'Waajjira Tajaajila Deeggarsa',
        office_number: 'SUP-301',
        department_id: 3,
        description: 'Support services and administrative office',
        floor: '3rd Floor',
        location: 'Building C, Room 301',
        phone: '+251911200003',
        email: 'support.office@office.gov.et',
        services_offered: 'Administrative support, Document processing, General inquiries',
      },
      {
        name: 'Control Center Operations',
        name_amharic: 'የቁጥጥር ማዕከል ስራዎች',
        name_afan_oromo: 'Hojii Giddugala Tooftuu',
        office_number: 'CC-401',
        department_id: 4,
        description: 'Central control and monitoring operations',
        floor: '4th Floor',
        location: 'Building D, Room 401',
        phone: '+251911200004',
        email: 'control.ops@office.gov.et',
        services_offered: 'Central monitoring, Coordination services, Emergency response',
      },
    ];

    // Offices already cleared above

    const insertOfficeQuery = `
      INSERT INTO offices (
        name, name_amharic, name_afan_oromo, office_number, department_id,
        description, floor, location, phone, email, services_offered,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;

    for (const office of offices) {
      await sequelize.query(insertOfficeQuery, {
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
        ],
      });
      console.log(`✅ Inserted office: ${office.name}`);
    }

    // Insert sample employees
    const employees = [
      {
        employee_id: 'CA001',
        first_name_en: 'Meseret',
        first_name_am: 'መሠረት',
        first_name_af: 'Masarat',
        last_name_en: 'Alemayehu',
        last_name_am: 'ዓለማየሁ',
        last_name_af: 'Alamaayahuu',
        office_id: 1,
        position_en: 'Control & Awareness Specialist',
        position_am: 'የቁጥጥር እና ግንዛቤ ባለሙያ',
        position_af: 'Ogeessa Tooftuu fi Hubannoo',
        department_en: 'Control & Awareness',
        department_am: 'ቁጥጥር እና ግንዛቤ',
        department_af: 'Tooftuu fi Hubannoo',
        section: 'Control & Awareness Services',
        city: 'Addis Ababa',
        subcity: 'Bole',
        email: 'meseret.alemayehu@office.gov.et',
        phone: '+251911300001',
        years_of_service: 5,
      },
      {
        employee_id: 'ENG001',
        first_name_en: 'Tadesse',
        first_name_am: 'ታደሰ',
        first_name_af: 'Tadasaa',
        last_name_en: 'Bekele',
        last_name_am: 'በቀለ',
        last_name_af: 'Baqqala',
        office_id: 2,
        position_en: 'Senior Engineer',
        position_am: 'ከፍተኛ ምህንዲስ',
        position_af: 'Injinara Olaanaa',
        department_en: 'Engineering',
        department_am: 'ምህንድስና',
        department_af: 'Injinarummaa',
        section: 'Engineering Services',
        city: 'Addis Ababa',
        subcity: 'Kirkos',
        email: 'tadesse.bekele@office.gov.et',
        phone: '+251911300002',
        years_of_service: 8,
      },
      {
        employee_id: 'SUP001',
        first_name_en: 'Rahel',
        first_name_am: 'ራሔል',
        first_name_af: 'Raahel',
        last_name_en: 'Tesfaye',
        last_name_am: 'ተስፋዬ',
        last_name_af: 'Tasfaayee',
        office_id: 3,
        position_en: 'Support Services Coordinator',
        position_am: 'የድጋፍ አገልግሎት አስተባባሪ',
        position_af: 'Qindoomtuu Tajaajila Deeggarsa',
        department_en: 'Support',
        department_am: 'ድጋፍ',
        department_af: 'Deeggarsa',
        section: 'Support Services',
        city: 'Addis Ababa',
        subcity: 'Arada',
        email: 'rahel.tesfaye@office.gov.et',
        phone: '+251911300003',
        years_of_service: 3,
      },
      {
        employee_id: 'CC001',
        first_name_en: 'Yohannes',
        first_name_am: 'ዮሃንስ',
        first_name_af: 'Yohaannis',
        last_name_en: 'Haile',
        last_name_am: 'ኃይለ',
        last_name_af: 'Haylaa',
        office_id: 4,
        position_en: 'Control Center Operator',
        position_am: 'የቁጥጥር ማዕከል ኦፕሬተር',
        position_af: 'Operator Giddugala Tooftuu',
        department_en: 'Control Center',
        department_am: 'የቁጥጥር ማዕከል',
        department_af: 'Giddugala Tooftuu',
        section: 'Control Center Operations',
        city: 'Addis Ababa',
        subcity: 'Yeka',
        email: 'yohannes.haile@office.gov.et',
        phone: '+251911300004',
        years_of_service: 6,
      },
    ];

    // Employees already cleared above

    const insertEmployeeQuery = `
      INSERT INTO employees (
        employee_id, first_name_en, first_name_am, first_name_af,
        last_name_en, last_name_am, last_name_af, office_id,
        position_en, position_am, position_af, department_en, department_am, department_af,
        section, city, subcity, email, phone, years_of_service,
        is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
    `;

    for (const employee of employees) {
      await sequelize.query(insertEmployeeQuery, {
        replacements: [
          employee.employee_id,
          employee.first_name_en,
          employee.first_name_am,
          employee.first_name_af,
          employee.last_name_en,
          employee.last_name_am,
          employee.last_name_af,
          employee.office_id,
          employee.position_en,
          employee.position_am,
          employee.position_af,
          employee.department_en,
          employee.department_am,
          employee.department_af,
          employee.section,
          employee.city,
          employee.subcity,
          employee.email,
          employee.phone,
          employee.years_of_service,
        ],
      });
      console.log(`✅ Inserted employee: ${employee.first_name_en} ${employee.last_name_en}`);
    }

    console.log('\n🎉 Successfully inserted all departments, offices, and employees!');
    console.log('\n📊 Summary:');
    console.log(`   • Departments: ${departments.length}`);
    console.log(`   • Offices: ${offices.length}`);
    console.log(`   • Employees: ${employees.length}`);

    // Verify data
    const [deptResult] = await sequelize.query('SELECT COUNT(*) as count FROM departments');
    const [officeResult] = await sequelize.query('SELECT COUNT(*) as count FROM offices');
    const [empResult] = await sequelize.query('SELECT COUNT(*) as count FROM employees');

    console.log('\n✅ Verification:');
    console.log(`   • Departments in DB: ${deptResult[0].count}`);
    console.log(`   • Offices in DB: ${officeResult[0].count}`);
    console.log(`   • Employees in DB: ${empResult[0].count}`);
  } catch (error) {
    console.error('❌ Error inserting departments:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the script
if (require.main === module) {
  insertDepartments()
    .then(() => {
      console.log('\n✅ Department insertion completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Department insertion failed:', error);
      process.exit(1);
    });
}

module.exports = { insertDepartments };
