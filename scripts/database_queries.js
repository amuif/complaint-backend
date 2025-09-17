/**
 * =====================================
 * OFFICE MANAGEMENT SYSTEM - DATABASE QUERIES
 * =====================================
 * This file contains all database table creation queries and schema definitions
 * for the Office Management System supporting both admin portals and public citizen services.
 *
 * Features:
 * - Multi-language support (English, Amharic, Afan Oromo)
 * - Complete hierarchical structure (City > Subcity > Department > Office)
 * - Comprehensive complaint, feedback, and rating systems
 * - Admin role-based access control
 * - Public citizen interface support
 *
 * Usage: node scripts/database_queries.js
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

// =====================================
// TABLE CREATION QUERIES
// =====================================

const DATABASE_QUERIES = {
  // Create database if not exists
  CREATE_DATABASE: `
    CREATE DATABASE IF NOT EXISTS ${DB_CONFIG.database} 
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  `,

  // Use database
  USE_DATABASE: `USE ${DB_CONFIG.database};`,

  // Set configuration
  SET_CONFIG: `
    SET NAMES utf8mb4;
    SET FOREIGN_KEY_CHECKS = 0;
    SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';
  `,

  // =====================================
  // CORE SYSTEM TABLES
  // =====================================

  // Departments table - Multi-language support with division relationship
  CREATE_DEPARTMENTS_TABLE: `
    CREATE TABLE IF NOT EXISTS departments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT 'Department name',
      name_en VARCHAR(100) COMMENT 'Department name in English',
      name_am VARCHAR(100) COMMENT 'Department name in Amharic',
      name_af VARCHAR(100) COMMENT 'Department name in Afan Oromo',
      code VARCHAR(20) UNIQUE COMMENT 'Unique department code',
      division_id INT NOT NULL COMMENT 'Reference to division',
      description_en TEXT COMMENT 'Department description in English',
      description_am TEXT COMMENT 'Department description in Amharic',
      description_af TEXT COMMENT 'Department description in Afan Oromo',
      is_active BOOLEAN DEFAULT TRUE COMMENT 'Department active status',
      contact_email VARCHAR(100) COMMENT 'Department contact email',
      contact_phone VARCHAR(15) COMMENT 'Department contact phone',
      head_name VARCHAR(100) COMMENT 'Department head name',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_dept_division (division_id),
      INDEX idx_dept_code (code),
      INDEX idx_dept_active (is_active),
      INDEX idx_dept_name (name),
      INDEX idx_dept_name_en (name_en)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Departments table with division relationships and multi-language support';
  `,

  // Offices table - Office locations within departments
  CREATE_OFFICES_TABLE: `
    CREATE TABLE IF NOT EXISTS offices (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT 'Office name',
      name_amharic VARCHAR(100) COMMENT 'Office name in Amharic',
      name_afan_oromo VARCHAR(100) COMMENT 'Office name in Afan Oromo',
      office_number VARCHAR(20) COMMENT 'Office number/identifier',
      department_id INT NOT NULL COMMENT 'Reference to department',
      description TEXT COMMENT 'Office description',
      floor VARCHAR(10) COMMENT 'Floor number/identifier',
      location VARCHAR(200) COMMENT 'Physical location description',
      is_active BOOLEAN DEFAULT TRUE COMMENT 'Office active status',
      phone VARCHAR(15) COMMENT 'Office direct phone',
      email VARCHAR(100) COMMENT 'Office email',
      services_offered TEXT COMMENT 'List of services offered',
      opening_hours VARCHAR(100) DEFAULT '8:00 AM - 5:00 PM' COMMENT 'Office hours',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_office_dept (department_id),
      INDEX idx_office_active (is_active),
      INDEX idx_office_number (office_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Offices table with department relationships';
  `,

  // Sectors table
  CREATE_SECTORS_TABLE: `
    CREATE TABLE IF NOT EXISTS sectors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT 'Sector name',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_sector_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Sectors table for organizational structure';
  `,

  // Divisions table
  CREATE_DIVISIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS divisions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT 'Division name',
      sector_id INT NOT NULL COMMENT 'Reference to sector',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_division_sector (sector_id),
      INDEX idx_division_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Divisions table with sector relationships';
  `,

  // Teams table
  CREATE_TEAMS_TABLE: `
    CREATE TABLE IF NOT EXISTS teams (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL COMMENT 'Team name',
      department_id INT NOT NULL COMMENT 'Reference to department',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
      INDEX idx_team_department (department_id),
      INDEX idx_team_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='Teams table with department relationships';
  `,

  // =====================================
  // ADMIN SYSTEM TABLES
  // =====================================

  // Admins table - Role-based admin access
  CREATE_ADMINS_TABLE: `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE COMMENT 'Admin username',
      password VARCHAR(255) NOT NULL COMMENT 'Hashed password',
      email VARCHAR(100) UNIQUE COMMENT 'Admin email address',
      role ENUM('SuperAdmin', 'SubCityAdmin', 'Admin') NOT NULL COMMENT 'Admin role level',
      first_name VARCHAR(50) COMMENT 'Admin first name',
      last_name VARCHAR(50) COMMENT 'Admin last name',
      city VARCHAR(100) COMMENT 'City jurisdiction',
      subcity VARCHAR(100) COMMENT 'Subcity jurisdiction',
      section VARCHAR(255) COMMENT 'Section/area responsibility',
      department VARCHAR(255) COMMENT 'Department assignment',
      phone VARCHAR(15) COMMENT 'Contact phone',
      profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
      is_active BOOLEAN DEFAULT TRUE COMMENT 'Admin account status',
      last_login TIMESTAMP NULL COMMENT 'Last login timestamp',
      failed_login_attempts INT DEFAULT 0 COMMENT 'Failed login counter',
      account_locked_until TIMESTAMP NULL COMMENT 'Account lock expiry',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_admin_username (username),
      INDEX idx_admin_role (role),
      INDEX idx_admin_city_subcity (city, subcity),
      INDEX idx_admin_active (is_active)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Admin users with role-based access control';
  `,

  // Password reset table
  CREATE_PASSWORD_RESETS_TABLE: `
    CREATE TABLE IF NOT EXISTS password_resets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL COMMENT 'Reference to admin',
      token VARCHAR(255) NOT NULL UNIQUE COMMENT 'Reset token',
      expires_at TIMESTAMP NOT NULL COMMENT 'Token expiry time',
      used BOOLEAN DEFAULT FALSE COMMENT 'Token usage status',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
      INDEX idx_reset_token (token),
      INDEX idx_reset_admin (admin_id),
      INDEX idx_reset_expires (expires_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Password reset tokens for admin users';
  `,

  // =====================================
  // EMPLOYEE SYSTEM TABLES
  // =====================================

  // Employees table - Multi-language employee information
  CREATE_EMPLOYEES_TABLE: `
    CREATE TABLE IF NOT EXISTS employees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employee_id VARCHAR(20) UNIQUE COMMENT 'Unique employee identifier',
      first_name_en VARCHAR(50) COMMENT 'First name in English',
      first_name_am VARCHAR(50) COMMENT 'First name in Amharic',
      first_name_af VARCHAR(50) COMMENT 'First name in Afan Oromo',
      middle_name_en VARCHAR(50) COMMENT 'Middle name in English',
      middle_name_am VARCHAR(50) COMMENT 'Middle name in Amharic',
      middle_name_af VARCHAR(50) COMMENT 'Middle name in Afan Oromo',
      last_name_en VARCHAR(50) COMMENT 'Last name in English',
      last_name_am VARCHAR(50) COMMENT 'Last name in Amharic',
      last_name_af VARCHAR(50) COMMENT 'Last name in Afan Oromo',
      office_id INT COMMENT 'Reference to office',
      office_number VARCHAR(10) COMMENT 'Office room number',
      floor_number INT COMMENT 'Floor number',
      position_en VARCHAR(100) COMMENT 'Position title in English',
      position_am VARCHAR(100) COMMENT 'Position title in Amharic',
      position_af VARCHAR(100) COMMENT 'Position title in Afan Oromo',
      department_en VARCHAR(100) COMMENT 'Department name in English',
      department_am VARCHAR(100) COMMENT 'Department name in Amharic',
      department_af VARCHAR(100) COMMENT 'Department name in Afan Oromo',

      -- Organizational hierarchy foreign keys
      sector_id INT COMMENT 'Reference to sector',
      division_id INT COMMENT 'Reference to division',
      department_id INT COMMENT 'Reference to department',
      team_id INT COMMENT 'Reference to team',

      section VARCHAR(255) NOT NULL COMMENT 'Section/Subcity assignment',
      city VARCHAR(100) COMMENT 'City location',
      subcity VARCHAR(100) COMMENT 'Subcity location',
      email VARCHAR(100) COMMENT 'Employee email',
      phone VARCHAR(15) COMMENT 'Employee phone',
      profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
      bio_en TEXT COMMENT 'Employee bio in English',
      bio_am TEXT COMMENT 'Employee bio in Amharic',
      bio_af TEXT COMMENT 'Employee bio in Afan Oromo',
      specializations TEXT COMMENT 'Employee specializations/skills',
      years_of_service INT DEFAULT 0 COMMENT 'Years of service',
      education_level VARCHAR(100) COMMENT 'Education level',
      is_active BOOLEAN DEFAULT TRUE COMMENT 'Employee active status',
      hire_date DATE COMMENT 'Date of hire',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      -- Foreign key constraints
      FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE,

      -- Indexes
      INDEX idx_emp_id (employee_id),
      INDEX idx_emp_section (section),
      INDEX idx_emp_city_subcity (city, subcity),
      INDEX idx_emp_department (department_en),
      INDEX idx_emp_active (is_active),
      INDEX idx_emp_office (office_id),
      INDEX idx_emp_sector (sector_id),
      INDEX idx_emp_division (division_id),
      INDEX idx_emp_department_id (department_id),
      INDEX idx_emp_team (team_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Employee information with multi-language support';
  `,

  // =====================================
  // COMPLAINT SYSTEM TABLES
  // =====================================

  // Internal complaints table (Admin portal)
  CREATE_COMPLAINTS_TABLE: `
    CREATE TABLE IF NOT EXISTS complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complainant_name VARCHAR(50) COMMENT 'Name of complainant',
      phone_number VARCHAR(20) NOT NULL COMMENT 'Contact phone number',
      email VARCHAR(100) COMMENT 'Contact email address',
      section VARCHAR(255) NOT NULL COMMENT 'Section/Subcity',
      kebele VARCHAR(20) COMMENT 'Kebele/Ward',
      province VARCHAR(100) COMMENT 'Province/Region',
      department VARCHAR(255) COMMENT 'Target department',
      office VARCHAR(255) COMMENT 'Target office',
      employee_id INT COMMENT 'Target employee (if specific)',
      complaint_category VARCHAR(100) COMMENT 'Category of complaint',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      description_en TEXT COMMENT 'Complaint description in English',
      description_am TEXT COMMENT 'Complaint description in Amharic',
      description_af TEXT COMMENT 'Complaint description in Afan Oromo',
      desired_action_en TEXT COMMENT 'Desired action in English',
      desired_action_am TEXT COMMENT 'Desired action in Amharic',
      desired_action_af TEXT COMMENT 'Desired action in Afan Oromo',
      response_en TEXT COMMENT 'Response in English',
      response_am TEXT COMMENT 'Response in Amharic',
      response_af TEXT COMMENT 'Response in Afan Oromo',
      voice_file VARCHAR(255) COMMENT 'Voice complaint file path',
      attachment_files JSON COMMENT 'Additional attachment files',
      tracking_code VARCHAR(36) NOT NULL UNIQUE COMMENT 'Unique tracking code',
      status ENUM('pending', 'in_progress', 'resolved', 'closed', 'escalated') DEFAULT 'pending',
      urgency_level INT DEFAULT 1 COMMENT 'Urgency level 1-5',
      assigned_to INT COMMENT 'Assigned admin ID',
      resolved_by INT COMMENT 'Admin who resolved',
      resolution_date TIMESTAMP NULL COMMENT 'Resolution timestamp',
      satisfaction_rating INT COMMENT 'Complainant satisfaction 1-5',
      internal_notes TEXT COMMENT 'Internal admin notes',
      follow_up_required BOOLEAN DEFAULT FALSE,
      follow_up_date DATE COMMENT 'Scheduled follow-up date',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (assigned_to) REFERENCES admins(id) ON DELETE SET NULL,
      FOREIGN KEY (resolved_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_complaint_tracking (tracking_code),
      INDEX idx_complaint_status (status),
      INDEX idx_complaint_section (section),
      INDEX idx_complaint_priority (priority),
      INDEX idx_complaint_assigned (assigned_to),
      INDEX idx_complaint_phone (phone_number),
      INDEX idx_complaint_date (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Internal complaint management system';
  `,

  // Public complaints table (Citizen portal)
  CREATE_PUBLIC_COMPLAINTS_TABLE: `
    CREATE TABLE IF NOT EXISTS public_complaints (
      id INT AUTO_INCREMENT PRIMARY KEY,
      complainant_name VARCHAR(100) NOT NULL COMMENT 'Citizen name',
      phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
      email VARCHAR(100) COMMENT 'Contact email',
      sub_city VARCHAR(50) NOT NULL COMMENT 'Subcity location',
      kebele VARCHAR(20) NOT NULL COMMENT 'Kebele/Ward',
      woreda VARCHAR(50) COMMENT 'Woreda',
      specific_location TEXT COMMENT 'Detailed location description',
      complaint_description TEXT NOT NULL COMMENT 'Complaint details',
      complaint_date DATE NOT NULL COMMENT 'Date of incident',
      department VARCHAR(100) NOT NULL COMMENT 'Target department',
      office VARCHAR(100) NOT NULL COMMENT 'Target office',
      service_type VARCHAR(100) COMMENT 'Type of service related',
      desired_action TEXT NOT NULL COMMENT 'What citizen wants done',
      tracking_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Public tracking code',
      status ENUM('pending', 'acknowledged', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
      priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
      voice_file_path VARCHAR(255) COMMENT 'Voice complaint file',
      attachment_files JSON COMMENT 'Supporting documents',
      response_text TEXT COMMENT 'Official response',
      response_date TIMESTAMP NULL COMMENT 'Response timestamp',
      resolved_by INT COMMENT 'Admin who resolved',
      resolved_at TIMESTAMP NULL COMMENT 'Resolution timestamp',
      citizen_satisfaction INT COMMENT 'Satisfaction rating 1-5',
      feedback_on_resolution TEXT COMMENT 'Citizen feedback on resolution',
      internal_notes TEXT COMMENT 'Internal processing notes',
      escalation_level INT DEFAULT 0 COMMENT 'Escalation level',
      escalated_to INT COMMENT 'Escalated to admin ID',
      escalation_reason TEXT COMMENT 'Reason for escalation',
      sms_notifications_sent INT DEFAULT 0 COMMENT 'SMS notification count',
      last_sms_sent TIMESTAMP NULL COMMENT 'Last SMS timestamp',
      contact_preference ENUM('sms', 'email', 'phone', 'none') DEFAULT 'sms',
      is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous complaint flag',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (resolved_by) REFERENCES admins(id) ON DELETE SET NULL,
      FOREIGN KEY (escalated_to) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_pub_complaint_tracking (tracking_code),
      INDEX idx_pub_complaint_status (status),
      INDEX idx_pub_complaint_subcity (sub_city),
      INDEX idx_pub_complaint_dept (department),
      INDEX idx_pub_complaint_phone (phone_number),
      INDEX idx_pub_complaint_priority (priority),
      INDEX idx_pub_complaint_date (complaint_date),
      INDEX idx_pub_complaint_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Public citizen complaint system';
  `,

  // =====================================
  // FEEDBACK SYSTEM TABLES
  // =====================================

  // Internal feedback table (Admin portal)
  CREATE_FEEDBACKS_TABLE: `
    CREATE TABLE IF NOT EXISTS feedbacks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      feedback_id VARCHAR(20) UNIQUE COMMENT 'Unique feedback identifier',
      citizen_name VARCHAR(100) COMMENT 'Citizen name (optional)',
      phone_number VARCHAR(20) NOT NULL COMMENT 'Contact phone',
      email VARCHAR(100) COMMENT 'Contact email',
      section VARCHAR(255) NOT NULL COMMENT 'Section/Subcity',
      department VARCHAR(255) COMMENT 'Target department',
      office VARCHAR(255) COMMENT 'Target office',
      employee_id INT COMMENT 'Target employee',
      feedback_type ENUM('complaint', 'suggestion', 'compliment', 'inquiry') NOT NULL,
      comment_en TEXT COMMENT 'Feedback in English',
      comment_am TEXT COMMENT 'Feedback in Amharic',
      comment_af TEXT COMMENT 'Feedback in Afan Oromo',
      rating INT COMMENT 'Overall rating 1-5',
      service_quality_rating INT COMMENT 'Service quality rating 1-5',
      staff_behavior_rating INT COMMENT 'Staff behavior rating 1-5',
      response_time_rating INT COMMENT 'Response time rating 1-5',
      facility_rating INT COMMENT 'Facility rating 1-5',
      improvement_suggestions TEXT COMMENT 'Suggestions for improvement',
      would_recommend BOOLEAN COMMENT 'Would recommend to others',
      response_text TEXT COMMENT 'Admin response',
      responded_by INT COMMENT 'Admin who responded',
      responded_at TIMESTAMP NULL COMMENT 'Response timestamp',
      status ENUM('pending', 'reviewed', 'responded', 'closed') DEFAULT 'pending',
      is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous feedback flag',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
      FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_feedback_id (feedback_id),
      INDEX idx_feedback_type (feedback_type),
      INDEX idx_feedback_section (section),
      INDEX idx_feedback_status (status),
      INDEX idx_feedback_rating (rating),
      INDEX idx_feedback_phone (phone_number)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Internal feedback management system';
  `,

  // Public feedback table (Citizen portal)
  CREATE_PUBLIC_FEEDBACK_TABLE: `
    CREATE TABLE IF NOT EXISTS public_feedback (
      id INT AUTO_INCREMENT PRIMARY KEY,
      citizen_name VARCHAR(100) COMMENT 'Citizen name (optional)',
      phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
      email VARCHAR(100) COMMENT 'Contact email',
      department VARCHAR(100) NOT NULL COMMENT 'Target department',
      office_location VARCHAR(200) COMMENT 'Office location visited',
      feedback_type ENUM('suggestion', 'compliment', 'concern', 'general', 'service_improvement') NOT NULL,
      subject VARCHAR(200) NOT NULL COMMENT 'Feedback subject',
      feedback_text TEXT NOT NULL COMMENT 'Detailed feedback',
      service_received VARCHAR(200) COMMENT 'Service type received',
      service_date DATE COMMENT 'Date service was received',
      staff_member_name VARCHAR(100) COMMENT 'Staff member involved',
      overall_satisfaction INT COMMENT 'Overall satisfaction 1-5',
      service_quality_rating INT COMMENT 'Service quality 1-5',
      staff_courtesy_rating INT COMMENT 'Staff courtesy 1-5',
      waiting_time_rating INT COMMENT 'Waiting time satisfaction 1-5',
      facility_cleanliness_rating INT COMMENT 'Facility rating 1-5',
      information_clarity_rating INT COMMENT 'Information clarity 1-5',
      improvement_suggestions TEXT COMMENT 'Specific improvement suggestions',
      would_recommend BOOLEAN COMMENT 'Would recommend service',
      contact_preference ENUM('sms', 'email', 'phone', 'none') DEFAULT 'none',
      tracking_code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Tracking reference',
      status ENUM('pending', 'reviewed', 'responded', 'implemented', 'closed') DEFAULT 'pending',
      response_text TEXT COMMENT 'Official response',
      responded_by INT COMMENT 'Admin who responded',
      responded_at TIMESTAMP NULL COMMENT 'Response timestamp',
      implementation_notes TEXT COMMENT 'Implementation status notes',
      follow_up_required BOOLEAN DEFAULT FALSE,
      follow_up_date DATE COMMENT 'Scheduled follow-up',
      is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous feedback flag',
      internal_category VARCHAR(100) COMMENT 'Internal categorization',
      priority_score INT DEFAULT 1 COMMENT 'Priority score 1-5',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (responded_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_pub_feedback_tracking (tracking_code),
      INDEX idx_pub_feedback_type (feedback_type),
      INDEX idx_pub_feedback_dept (department),
      INDEX idx_pub_feedback_status (status),
      INDEX idx_pub_feedback_phone (phone_number),
      INDEX idx_pub_feedback_date (service_date),
      INDEX idx_pub_feedback_priority (priority_score)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Public citizen feedback system';
  `,

  // =====================================
  // RATING SYSTEM TABLES
  // =====================================

  // Internal ratings table (Admin portal)
  CREATE_RATINGS_TABLE: `
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      rating_id VARCHAR(20) UNIQUE COMMENT 'Unique rating identifier',
      employee_id INT NOT NULL COMMENT 'Rated employee',
      rater_name VARCHAR(100) COMMENT 'Name of person giving rating',
      rater_phone VARCHAR(15) COMMENT 'Rater contact phone',
      rater_email VARCHAR(100) COMMENT 'Rater email',
      department VARCHAR(100) COMMENT 'Employee department',
      section VARCHAR(255) COMMENT 'Section/Subcity',
      service_type VARCHAR(100) COMMENT 'Type of service rated',
      overall_rating INT NOT NULL COMMENT 'Overall rating 1-5',
      professionalism_rating INT COMMENT 'Professionalism 1-5',
      responsiveness_rating INT COMMENT 'Responsiveness 1-5',
      knowledge_rating INT COMMENT 'Knowledge/Expertise 1-5',
      communication_rating INT COMMENT 'Communication skills 1-5',
      problem_solving_rating INT COMMENT 'Problem solving 1-5',
      comments TEXT COMMENT 'Additional comments',
      improvement_suggestions TEXT COMMENT 'Suggestions for improvement',
      service_date DATE COMMENT 'Date of service',
      would_recommend BOOLEAN COMMENT 'Would recommend employee',
      is_verified BOOLEAN DEFAULT FALSE COMMENT 'Rating verification status',
      verified_by INT COMMENT 'Admin who verified',
      verification_date TIMESTAMP NULL COMMENT 'Verification timestamp',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
      FOREIGN KEY (verified_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_rating_id (rating_id),
      INDEX idx_rating_employee (employee_id),
      INDEX idx_rating_overall (overall_rating),
      INDEX idx_rating_section (section),
      INDEX idx_rating_verified (is_verified),
      INDEX idx_rating_date (service_date)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Employee rating system';
  `,

  // Public ratings table (Citizen portal)
  CREATE_PUBLIC_RATINGS_TABLE: `
    CREATE TABLE IF NOT EXISTS public_ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      citizen_name VARCHAR(100) COMMENT 'Citizen name (optional)',
      phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
      email VARCHAR(100) COMMENT 'Contact email',
      department VARCHAR(100) NOT NULL COMMENT 'Rated department',
      office_location VARCHAR(200) COMMENT 'Office location',
      service_type VARCHAR(100) NOT NULL COMMENT 'Type of service received',
      employee_name VARCHAR(100) COMMENT 'Employee who provided service',
      employee_position VARCHAR(100) COMMENT 'Employee position/title',
      visit_date DATE NOT NULL COMMENT 'Date of service',
      overall_rating INT NOT NULL COMMENT 'Overall experience 1-5',
      service_quality_rating INT NOT NULL COMMENT 'Service quality 1-5',
      staff_behavior_rating INT NOT NULL COMMENT 'Staff behavior 1-5',
      waiting_time_rating INT COMMENT 'Waiting time satisfaction 1-5',
      facility_rating INT COMMENT 'Facility quality 1-5',
      information_accessibility_rating INT COMMENT 'Information accessibility 1-5',
      problem_resolution_rating INT COMMENT 'Problem resolution 1-5',
      value_for_time_rating INT COMMENT 'Value for time spent 1-5',
      specific_comments TEXT COMMENT 'Specific feedback',
      positive_aspects TEXT COMMENT 'What went well',
      areas_for_improvement TEXT COMMENT 'Areas needing improvement',
      would_recommend BOOLEAN COMMENT 'Would recommend to others',
      likelihood_to_return INT COMMENT 'Likelihood to return 1-5',
      comparison_to_expectations ENUM('exceeded', 'met', 'below') COMMENT 'Compared to expectations',
      suggestion_for_improvement TEXT COMMENT 'Specific suggestions',
      contact_for_follow_up BOOLEAN DEFAULT FALSE COMMENT 'Open to follow-up contact',
      rating_helpfulness_votes INT DEFAULT 0 COMMENT 'How many found this helpful',
      is_verified BOOLEAN DEFAULT FALSE COMMENT 'Verification status',
      verification_method VARCHAR(50) COMMENT 'How rating was verified',
      is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous rating flag',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_pub_rating_dept (department),
      INDEX idx_pub_rating_overall (overall_rating),
      INDEX idx_pub_rating_service (service_type),
      INDEX idx_pub_rating_phone (phone_number),
      INDEX idx_pub_rating_date (visit_date),
      INDEX idx_pub_rating_verified (is_verified)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='Public service rating system';
  `,

  // =====================================
  // SYSTEM MONITORING TABLES
  // =====================================

  // Activity logs table
  CREATE_ACTIVITY_LOGS_TABLE: `
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT COMMENT 'Admin who performed action',
      action VARCHAR(100) NOT NULL COMMENT 'Action performed',
      entity_type VARCHAR(50) NOT NULL COMMENT 'Type of entity affected',
      entity_id INT COMMENT 'ID of affected entity',
      details JSON COMMENT 'Additional action details',
      ip_address VARCHAR(45) COMMENT 'IP address of request',
      user_agent TEXT COMMENT 'Browser/client information',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_log_admin (admin_id),
      INDEX idx_log_action (action),
      INDEX idx_log_entity (entity_type, entity_id),
      INDEX idx_log_date (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='System activity logging';
  `,

  // System settings table
  CREATE_SYSTEM_SETTINGS_TABLE: `
    CREATE TABLE IF NOT EXISTS system_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'Setting identifier',
      setting_value TEXT COMMENT 'Setting value',
      setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
      description TEXT COMMENT 'Setting description',
      category VARCHAR(50) COMMENT 'Setting category',
      is_public BOOLEAN DEFAULT FALSE COMMENT 'Publicly accessible setting',
      updated_by INT COMMENT 'Admin who last updated',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE SET NULL,
      INDEX idx_setting_key (setting_key),
      INDEX idx_setting_category (category),
      INDEX idx_setting_public (is_public)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
    COMMENT='System configuration settings';
  `,

  // Notifications table
  CREATE_NOTIFICATIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      recipient_id INT COMMENT 'User/Admin/Employee ID',
      recipient_type ENUM('admin', 'employee', 'citizen') NOT NULL,
      notification_type ENUM('sms', 'email', 'in_app') NOT NULL,
      message TEXT NOT NULL,
      status ENUM('pending', 'sent', 'failed', 'read') DEFAULT 'pending',
      related_entity_type VARCHAR(50) COMMENT 'Related entity (complaint, feedback, etc)',
      related_entity_id INT COMMENT 'Related entity ID',
      sent_at TIMESTAMP NULL,
      read_at TIMESTAMP NULL,
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_notification_recipient (recipient_id, recipient_type),
      INDEX idx_notification_status (status),
      INDEX idx_notification_type (notification_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    COMMENT='System notifications for users/admins/employees';
  `,

  // =====================================
  // DATABASE INDEXES FOR PERFORMANCE
  // =====================================

  CREATE_PERFORMANCE_INDEXES: `
    -- Additional performance indexes
    CREATE INDEX IF NOT EXISTS idx_complaints_status_date ON complaints(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_public_complaints_status_date ON public_complaints(status, created_at);
    CREATE INDEX IF NOT EXISTS idx_feedback_type_date ON feedbacks(feedback_type, created_at);
    CREATE INDEX IF NOT EXISTS idx_public_feedback_type_date ON public_feedback(feedback_type, created_at);
    CREATE INDEX IF NOT EXISTS idx_ratings_employee_date ON ratings(employee_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_public_ratings_dept_date ON public_ratings(department, created_at);
    
    -- Full-text search indexes
    CREATE FULLTEXT INDEX IF NOT EXISTS ft_complaint_description ON complaints(description_en, description_am, description_af);
    CREATE FULLTEXT INDEX IF NOT EXISTS ft_public_complaint_description ON public_complaints(complaint_description);
    CREATE FULLTEXT INDEX IF NOT EXISTS ft_feedback_comments ON feedbacks(comment_en, comment_am, comment_af);
    CREATE FULLTEXT INDEX IF NOT EXISTS ft_public_feedback_text ON public_feedback(feedback_text, subject);
    CREATE FULLTEXT INDEX IF NOT EXISTS ft_employee_names ON employees(first_name_en, middle_name_en, last_name_en);
  `,

  // =====================================
  // RESET FOREIGN KEY CHECKS
  // =====================================

  RESET_CONFIG: `SET FOREIGN_KEY_CHECKS = 1;`,
};

// =====================================
// DATABASE SETUP FUNCTION
// =====================================

async function setupDatabase() {
  let connection;

  try {
    console.log('🚀 Starting Office Management System Database Setup...');

    // Connect without database first to create it
    connection = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      charset: DB_CONFIG.charset,
    });

    console.log('✅ Connected to MySQL server');

    // Create database
    await connection.execute(DATABASE_QUERIES.CREATE_DATABASE);
    console.log('✅ Database created/verified');

    // Use database
    await connection.execute(DATABASE_QUERIES.USE_DATABASE);
    console.log('✅ Using database:', DB_CONFIG.database);

    // Set configuration
    await connection.execute(DATABASE_QUERIES.SET_CONFIG);
    console.log('✅ Database configuration set');

    // Create all tables
    const tableQueries = [
      'CREATE_DEPARTMENTS_TABLE',
      'CREATE_OFFICES_TABLE',
      'CREATE_SECTORS_TABLE',
      'CREATE_DIVISIONS_TABLE',
      'CREATE_TEAMS_TABLE',
      'CREATE_ADMINS_TABLE',
      'CREATE_PASSWORD_RESETS_TABLE',
      'CREATE_EMPLOYEES_TABLE',
      'CREATE_COMPLAINTS_TABLE',
      'CREATE_PUBLIC_COMPLAINTS_TABLE',
      'CREATE_FEEDBACKS_TABLE',
      'CREATE_PUBLIC_FEEDBACK_TABLE',
      'CREATE_RATINGS_TABLE',
      'CREATE_PUBLIC_RATINGS_TABLE',
      'CREATE_ACTIVITY_LOGS_TABLE',
      'CREATE_SYSTEM_SETTINGS_TABLE',
      'CREATE_NOTIFICATIONS_TABLE',
    ];

    for (const queryName of tableQueries) {
      await connection.execute(DATABASE_QUERIES[queryName]);
      console.log(
        `✅ Table created: ${queryName.replace('CREATE_', '').replace('_TABLE', '').toLowerCase()}`
      );
    }

    // Create performance indexes
    await connection.execute(DATABASE_QUERIES.CREATE_PERFORMANCE_INDEXES);
    console.log('✅ Performance indexes created');

    // Reset configuration
    await connection.execute(DATABASE_QUERIES.RESET_CONFIG);
    console.log('✅ Foreign key checks restored');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Schema Summary:');
    console.log('   • Core Tables: departments, offices, admins, employees');
    console.log('   • Complaint System: complaints, public_complaints');
    console.log('   • Feedback System: feedbacks, public_feedback');
    console.log('   • Rating System: ratings, public_ratings');
    console.log(
      '   • System Tables: activity_logs, system_settings, password_resets, notifications'
    );
    console.log('\n🔧 Features Enabled:');
    console.log('   • Multi-language support (English, Amharic, Afan Oromo)');
    console.log('   • Role-based admin access (SuperAdmin, SubCityAdmin, Admin)');
    console.log('   • Public citizen portal');
    console.log('   • File attachment support');
    console.log('   • Full-text search capabilities');
    console.log('   • Activity logging and monitoring');
    console.log('\n🚀 Ready for data insertion and application startup!');
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure MySQL server is running');
    console.error('   2. Check database credentials in .env file');
    console.error('   3. Verify user has CREATE DATABASE privileges');
    console.error('   4. Check MySQL version compatibility (5.7+ recommended)');
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// =====================================
// EXPORT MODULE
// =====================================

module.exports = {
  DATABASE_QUERIES,
  setupDatabase,
  DB_CONFIG,
};

// Run setup if called directly
if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
