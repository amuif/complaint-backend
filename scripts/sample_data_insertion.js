/**
 * =====================================
 * OFFICE MANAGEMENT SYSTEM - SAMPLE DATA INSERTION
 * =====================================
 * This file contains sample data for populating the database with realistic test data
 * supporting multi-language content and all system features.
 *
 * Usage: node scripts/sample_data_insertion.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const notificationService = require('./notification_service');

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'office_management',
  charset: 'utf8mb4',
};

// =====================================
// SAMPLE DATA SETS
// =====================================

const SAMPLE_DATA = {
  // Departments with multi-language support
  departments: [
    {
      id: 1,
      name_en: 'Control and Awareness Department',
      name_am: 'ቁጥጥርና ግንዛቤ ዘርፍ',
      name_af: 'Kutaataa fi Hubannoo Damee',
      code: 'CAD',
      description_en:
        'Handles control and awareness operations, monitoring compliance and raising awareness',
      description_am: 'ቁጥጥርና ግንዛቤ ኦፕሬሽኖችን ያስተናግዳል',
      description_af: 'Hojii kutaataa fi hubannoo raawwata',
      contact_email: 'control@office.gov.et',
      contact_phone: '+251-11-1234567',
      head_name: 'Dr. Ahmed Hassan',
    },
    {
      id: 2,
      name_en: 'Engineering Department',
      name_am: 'ኢንጂነሪንግ ዘርፍ',
      name_af: 'Injiniirummaa Damee',
      code: 'ENG',
      description_en: 'Manages engineering and technical services, infrastructure development',
      description_am: 'የኢንጂነሪንግ እና ቴክኒካል አገልግሎቶችን ያስተዳድራል',
      description_af: 'Tajaajila injiniirummaa fi teeknikaa bulcha',
      contact_email: 'engineering@office.gov.et',
      contact_phone: '+251-11-1234568',
      head_name: 'Eng. Sara Getachew',
    },
    {
      id: 3,
      name_en: 'Support Administration Department',
      name_am: 'ድጋፍ አስተዳደር ዘርፍ',
      name_af: 'Bulchiinsa Deeggarsa Damee',
      code: 'SAD',
      description_en: 'Provides administrative support and manages operational logistics',
      description_am: 'የአስተዳደር ድጋፍ ይሰጣል እና የአሰራር ሎጂስቲክስን ያስተዳድራል',
      description_af: 'Deeggarsa bulchiinsaa fi logistikii hojii bulcha',
      contact_email: 'admin@office.gov.et',
      contact_phone: '+251-11-1234569',
      head_name: 'Mr. Yohannes Desta',
    },
    {
      id: 4,
      name_en: 'Control Center Department',
      name_am: 'ቁጥጥር ማዕከል ዘርፍ',
      name_af: 'Kutaataa Giddugaleessa Damee',
      code: 'CCD',
      description_en: 'Central control and coordination of operations and monitoring',
      description_am: 'የኦፕሬሽኖች ማዕከላዊ ቁጥጥር እና ቅንጅት',
      description_af: 'Kutaataa giddugaleessaa fi qindeessaa hojiwwanii',
      contact_email: 'control-center@office.gov.et',
      contact_phone: '+251-11-1234570',
      head_name: 'Ms. Rahel Mulugeta',
    },
  ],

  // Offices within departments
  offices: [
    {
      id: 1,
      name: 'Main Control Office',
      name_amharic: 'ዋናው ቁጥጥር ቢሮ',
      name_afan_oromo: 'Waajjira Kutaataa Ijoo',
      office_number: 'A101',
      department_id: 1,
      description: 'Primary control and monitoring office',
      floor: '1st Floor',
      location: 'Main Building Block A',
      phone: '+251-11-1234567',
      email: 'control@office.gov.et',
      services_offered: 'Control operations, compliance monitoring, public awareness',
    },
    {
      id: 2,
      name: 'Quality Assurance Office',
      name_amharic: 'የጥራት ማረጋገጫ ቢሮ',
      name_afan_oromo: 'Waajjira Mirkaneessa Qulqullina',
      office_number: 'A102',
      department_id: 1,
      description: 'Quality control and assurance services',
      floor: '1st Floor',
      location: 'Main Building Block A',
      phone: '+251-11-1234568',
      email: 'qa@office.gov.et',
      services_offered: 'Quality control, certification, standards compliance',
    },
  ],

  // Admin users with different roles
  admins: [
    {
      id: 1,
      username: 'superadmin',
      password: 'password123', // Will be hashed
      email: 'superadmin@office.gov.et',
      role: 'SuperAdmin',
      first_name: 'System',
      last_name: 'Administrator',
      city: 'Addis Ababa',
      phone: '+251-11-1111111',
      profile_picture:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 2,
      username: 'bole_admin',
      password: 'password123',
      email: 'bole@office.gov.et',
      role: 'SubCityAdmin',
      first_name: 'Kebede',
      last_name: 'Tadesse',
      city: 'Addis Ababa',
      subcity: 'Bole',
      section: 'Bole',
      phone: '+251-11-2222222',
      profile_picture:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 3,
      username: 'arada_admin',
      password: 'password123',
      email: 'arada@office.gov.et',
      role: 'SubCityAdmin',
      first_name: 'Meron',
      last_name: 'Haile',
      city: 'Addis Ababa',
      subcity: 'Arada',
      section: 'Arada',
      phone: '+251-11-3333333',
      profile_picture:
        'https://images.unsplash.com/photo-1494790108755-2616c6a88690?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 4,
      username: 'control_admin',
      password: 'password123',
      email: 'control@office.gov.et',
      role: 'Admin',
      first_name: 'Ahmed',
      last_name: 'Kassim',
      city: 'Addis Ababa',
      department: 'Control and Awareness Department',
      phone: '+251-11-4444444',
      profile_picture:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 5,
      username: 'engineering_admin',
      password: 'password123',
      email: 'engineering@office.gov.et',
      role: 'Admin',
      first_name: 'Sara',
      last_name: 'Getachew',
      city: 'Addis Ababa',
      department: 'Engineering Department',
      phone: '+251-11-5555555',
      profile_picture:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 6,
      username: 'support_admin',
      password: 'password123',
      email: 'support@office.gov.et',
      role: 'Admin',
      first_name: 'Daniel',
      last_name: 'Mulugeta',
      city: 'Addis Ababa',
      department: 'Support Administration Department',
      phone: '+251-11-6666666',
      profile_picture:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
    },
    {
      id: 7,
      username: 'control_center_admin',
      password: 'password123',
      email: 'controlcenter@office.gov.et',
      role: 'Admin',
      first_name: 'Rahel',
      last_name: 'Abebe',
      city: 'Addis Ababa',
      department: 'Control Center Department',
      phone: '+251-11-7777777',
      profile_picture:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
    },
  ],

  // Sample employees with multi-language information
  employees: [
    {
      id: 1,
      employee_id: 'EMP001',
      first_name_en: 'Ahmed',
      first_name_am: 'አህመድ',
      first_name_af: 'Ahmed',
      middle_name_en: 'Mohammed',
      middle_name_am: 'መሐመድ',
      middle_name_af: 'Mohammed',
      last_name_en: 'Hassan',
      last_name_am: 'ሐሰን',
      last_name_af: 'Hassan',
      office_id: 1,
      office_number: 'A101',
      floor_number: 1,
      position_en: 'Senior Control Officer',
      position_am: 'ከፍተኛ ቁጥጥር ባለሙያ',
      position_af: "Ogeessa Kutaataa Ol'aanaa",
      department_en: 'Control and Awareness Department',
      department_am: 'ቁጥጥርና ግንዛቤ ዘርፍ',
      department_af: 'Kutaataa fi Hubannoo Damee',
      section: 'Bole',
      city: 'Addis Ababa',
      subcity: 'Bole',
      email: 'ahmed.hassan@office.gov.et',
      phone: '+251-911-123456',
      bio_en: 'Experienced control officer with 8 years in public service',
      bio_am: 'በመንግስት አገልግሎት 8 ዓመት ልምድ ያለው የቁጥጥር ባለሙያ',
      bio_af: 'Ogeessa kutaataa muuxannoo waggaa 8 tajaajila mootummaa qabu',
      years_of_service: 8,
      education_level: "Bachelor's Degree",
      hire_date: '2015-03-15',
      profile_picture:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
    },
  ],

  // Sample public complaints
  public_complaints: [
    {
      id: 1,
      complainant_name: 'Tigist Bekele',
      phone_number: '+251-911-111111',
      email: 'tigist.bekele@email.com',
      sub_city: 'Bole',
      kebele: '15',
      complaint_description:
        'Long waiting time and poor service quality at the licensing office. Staff were not helpful and the process was very slow.',
      complaint_date: '2024-01-15',
      department: 'Control and Awareness Department',
      office: 'Main Control Office',
      service_type: 'Business License',
      desired_action: 'Improve service delivery and reduce waiting times',
      tracking_code: 'PUB240001',
      status: 'pending',
      priority: 'medium',
    },
  ],

  // Sample public feedback
  public_feedback: [
    {
      id: 1,
      citizen_name: 'Daniel Mekuria',
      phone_number: '+251-911-222222',
      email: 'daniel.m@email.com',
      department: 'Engineering Department',
      feedback_type: 'suggestion',
      subject: 'Online Service Platform',
      feedback_text:
        'It would be great to have an online platform for submitting applications and tracking progress. This would save time for both citizens and staff.',
      service_received: 'Construction Permit',
      overall_satisfaction: 4,
      tracking_code: 'FB240001',
      status: 'pending',
    },
  ],

  // Sample public ratings
  public_ratings: [
    {
      id: 1,
      citizen_name: 'Sara Getachew',
      phone_number: '+251-911-333333',
      department: 'Support Administration Department',
      service_type: 'Document Processing',
      visit_date: '2024-01-10',
      overall_rating: 4,
      service_quality_rating: 4,
      staff_behavior_rating: 5,
      waiting_time_rating: 3,
      facility_rating: 4,
      specific_comments: 'Very helpful staff, but waiting time could be improved',
      positive_aspects: 'Professional and courteous staff members',
      would_recommend: true,
    },
  ],

  // System settings
  system_settings: [
    {
      setting_key: 'site_name',
      setting_value: 'Office Management System',
      setting_type: 'string',
      description: 'Website/System name',
      category: 'general',
      is_public: true,
    },
    {
      setting_key: 'max_complaint_attachments',
      setting_value: '5',
      setting_type: 'number',
      description: 'Maximum number of attachments per complaint',
      category: 'limits',
      is_public: false,
    },
    {
      setting_key: 'sms_notifications_enabled',
      setting_value: 'true',
      setting_type: 'boolean',
      description: 'Enable SMS notifications for citizens',
      category: 'notifications',
      is_public: false,
    },
  ],
};

// =====================================
// DATA INSERTION FUNCTIONS
// =====================================

async function insertSampleData() {
  let connection;

  try {
    console.log('🚀 Starting sample data insertion...');

    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✅ Connected to database');

    // Clear existing data
    await clearExistingData(connection);

    // Insert departments
    await insertDepartments(connection);

    // Insert offices
    await insertOffices(connection);

    // Insert admins (with hashed passwords)
    await insertAdmins(connection);

    // Insert employees
    await insertEmployees(connection);

    // Insert sample complaints
    await insertPublicComplaints(connection);

    // Insert sample feedback
    await insertPublicFeedback(connection);

    // Insert sample ratings
    await insertPublicRatings(connection);

    // Insert system settings
    await insertSystemSettings(connection);

    console.log('\n🎉 Sample data insertion completed successfully!');
    console.log('\n📊 Data Summary:');
    console.log(`   • ${SAMPLE_DATA.departments.length} Departments`);
    console.log(`   • ${SAMPLE_DATA.offices.length} Offices`);
    console.log(`   • ${SAMPLE_DATA.admins.length} Admin Users`);
    console.log(`   • ${SAMPLE_DATA.employees.length} Employees`);
    console.log(`   • ${SAMPLE_DATA.public_complaints.length} Sample Complaints`);
    console.log(`   • ${SAMPLE_DATA.public_feedback.length} Sample Feedback`);
    console.log(`   • ${SAMPLE_DATA.public_ratings.length} Sample Ratings`);
    console.log(`   • ${SAMPLE_DATA.system_settings.length} System Settings`);

    console.log('\n🔐 Admin Login Credentials:');
    console.log('   SuperAdmin: superadmin / password123');
    console.log('   Bole Admin: bole_admin / password123');
    console.log('   Arada Admin: arada_admin / password123');
    console.log('   Control & Awareness Admin: control_admin / password123');
    console.log('   Engineering Admin: engineering_admin / password123');
    console.log('   Support Admin: support_admin / password123');
    console.log('   Control Center Admin: control_center_admin / password123');
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function clearExistingData(connection) {
  console.log('🧹 Clearing existing data...');

  const clearQueries = [
    'SET FOREIGN_KEY_CHECKS = 0;',
    'TRUNCATE TABLE activity_logs;',
    'TRUNCATE TABLE public_ratings;',
    'TRUNCATE TABLE public_feedback;',
    'TRUNCATE TABLE public_complaints;',
    'TRUNCATE TABLE ratings;',
    'TRUNCATE TABLE feedbacks;',
    'TRUNCATE TABLE complaints;',
    'TRUNCATE TABLE employees;',
    'TRUNCATE TABLE offices;',
    'TRUNCATE TABLE departments;',
    'TRUNCATE TABLE password_resets;',
    'TRUNCATE TABLE admins;',
    'TRUNCATE TABLE system_settings;',
    'SET FOREIGN_KEY_CHECKS = 1;',
  ];

  for (const query of clearQueries) {
    await connection.execute(query);
  }

  console.log('✅ Existing data cleared');
}

async function insertDepartments(connection) {
  console.log('📁 Inserting departments...');

  const query = `
    INSERT INTO departments (
      id, name_en, name_am, name_af, code, description_en, description_am, 
      description_af, contact_email, contact_phone, head_name
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const dept of SAMPLE_DATA.departments) {
    await connection.execute(query, [
      dept.id,
      dept.name_en,
      dept.name_am,
      dept.name_af,
      dept.code,
      dept.description_en,
      dept.description_am,
      dept.description_af,
      dept.contact_email,
      dept.contact_phone,
      dept.head_name,
    ]);
  }

  console.log('✅ Departments inserted');
}

async function insertOffices(connection) {
  console.log('🏢 Inserting offices...');

  const query = `
    INSERT INTO offices (
      id, name, name_amharic, name_afan_oromo, office_number, department_id,
      description, floor, location, phone, email, services_offered
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const office of SAMPLE_DATA.offices) {
    await connection.execute(query, [
      office.id,
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
    ]);
  }

  console.log('✅ Offices inserted');
}

async function insertAdmins(connection) {
  console.log('👥 Inserting admin users...');

  const query = `
    INSERT INTO admins (
      id, username, password, email, role, first_name, last_name,
      city, subcity, section, department, phone, profile_picture
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const admin of SAMPLE_DATA.admins) {
    const hashedPassword = await bcrypt.hash(admin.password, 10);

    await connection.execute(query, [
      admin.id,
      admin.username,
      hashedPassword,
      admin.email,
      admin.role,
      admin.first_name,
      admin.last_name,
      admin.city,
      admin.subcity,
      admin.section,
      admin.department,
      admin.phone,
      admin.profile_picture,
    ]);
  }

  console.log('✅ Admin users inserted');
}

async function insertEmployees(connection) {
  console.log('👷 Inserting employees...');

  const query = `
    INSERT INTO employees (
      id, employee_id, first_name_en, first_name_am, first_name_af,
      middle_name_en, middle_name_am, middle_name_af,
      last_name_en, last_name_am, last_name_af,
      office_id, office_number, floor_number,
      position_en, position_am, position_af,
      department_en, department_am, department_af,
      section, city, subcity, email, phone,
      bio_en, bio_am, bio_af, years_of_service,
      education_level, hire_date, profile_picture
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const emp of SAMPLE_DATA.employees) {
    await connection.execute(query, [
      emp.id,
      emp.employee_id,
      emp.first_name_en,
      emp.first_name_am,
      emp.first_name_af,
      emp.middle_name_en,
      emp.middle_name_am,
      emp.middle_name_af,
      emp.last_name_en,
      emp.last_name_am,
      emp.last_name_af,
      emp.office_id,
      emp.office_number,
      emp.floor_number,
      emp.position_en,
      emp.position_am,
      emp.position_af,
      emp.department_en,
      emp.department_am,
      emp.department_af,
      emp.section,
      emp.city,
      emp.subcity,
      emp.email,
      emp.phone,
      emp.bio_en,
      emp.bio_am,
      emp.bio_af,
      emp.years_of_service,
      emp.education_level,
      emp.hire_date,
      emp.profile_picture,
    ]);
  }

  console.log('✅ Employees inserted');
}

async function insertPublicComplaints(connection) {
  console.log('📝 Inserting sample complaints...');

  const query = `
    INSERT INTO public_complaints (
      id, complainant_name, phone_number, email, sub_city, kebele,
      complaint_description, complaint_date, department, office,
      service_type, desired_action, tracking_code, status, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const complaint of SAMPLE_DATA.public_complaints) {
    await connection.execute(query, [
      complaint.id,
      complaint.complainant_name,
      complaint.phone_number,
      complaint.email,
      complaint.sub_city,
      complaint.kebele,
      complaint.complaint_description,
      complaint.complaint_date,
      complaint.department,
      complaint.office,
      complaint.service_type,
      complaint.desired_action,
      complaint.tracking_code,
      complaint.status,
      complaint.priority,
    ]);

    // Send notification to admin (example)
    await notificationService.notify({
      recipient: {
        id: 1, // SuperAdmin ID or relevant admin
        type: 'admin',
        phone: '+251-11-1111111',
        email: 'superadmin@office.gov.et',
      },
      type: 'sms',
      message: `New public complaint submitted: ${complaint.complaint_description}`,
      related_entity_type: 'public_complaint',
      related_entity_id: complaint.id,
    });
  }

  console.log('✅ Sample complaints inserted');
}

async function insertPublicFeedback(connection) {
  console.log('💬 Inserting sample feedback...');

  const query = `
    INSERT INTO public_feedback (
      id, citizen_name, phone_number, email, department, feedback_type,
      subject, feedback_text, service_received, overall_satisfaction,
      tracking_code, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const feedback of SAMPLE_DATA.public_feedback) {
    await connection.execute(query, [
      feedback.id,
      feedback.citizen_name,
      feedback.phone_number,
      feedback.email,
      feedback.department,
      feedback.feedback_type,
      feedback.subject,
      feedback.feedback_text,
      feedback.service_received,
      feedback.overall_satisfaction,
      feedback.tracking_code,
      feedback.status,
    ]);
  }

  console.log('✅ Sample feedback inserted');
}

async function insertPublicRatings(connection) {
  console.log('⭐ Inserting sample ratings...');

  const query = `
    INSERT INTO public_ratings (
      id, citizen_name, phone_number, department, service_type, visit_date,
      overall_rating, service_quality_rating, staff_behavior_rating,
      waiting_time_rating, facility_rating, specific_comments,
      positive_aspects, would_recommend
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  for (const rating of SAMPLE_DATA.public_ratings) {
    await connection.execute(query, [
      rating.id,
      rating.citizen_name,
      rating.phone_number,
      rating.department,
      rating.service_type,
      rating.visit_date,
      rating.overall_rating,
      rating.service_quality_rating,
      rating.staff_behavior_rating,
      rating.waiting_time_rating,
      rating.facility_rating,
      rating.specific_comments,
      rating.positive_aspects,
      rating.would_recommend,
    ]);
  }

  console.log('✅ Sample ratings inserted');
}

async function insertSystemSettings(connection) {
  console.log('⚙️ Inserting system settings...');

  const query = `
    INSERT INTO system_settings (
      setting_key, setting_value, setting_type, description, category, is_public
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;

  for (const setting of SAMPLE_DATA.system_settings) {
    await connection.execute(query, [
      setting.setting_key,
      setting.setting_value,
      setting.setting_type,
      setting.description,
      setting.category,
      setting.is_public,
    ]);
  }

  console.log('✅ System settings inserted');
}

// =====================================
// EXPORT MODULE
// =====================================

module.exports = {
  insertSampleData,
  SAMPLE_DATA,
  DB_CONFIG,
};

// Run insertion if called directly
if (require.main === module) {
  insertSampleData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
