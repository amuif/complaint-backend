-- =====================================
-- OFFICE MANAGEMENT SYSTEM - HOSTING DATABASE SETUP
-- =====================================
-- Complete SQL script for hosting server deployment
-- Copy and paste this entire script into your hosting database manager
-- 
-- Instructions:
-- 1. Create a new database on your hosting server
-- 2. Copy this entire script
-- 3. Paste and execute in your database manager (phpMyAdmin, etc.)
-- 4. Update your .env file with the database credentials
-- =====================================

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- =====================================
-- CORE SYSTEM TABLES
-- =====================================
-- subcities
CREATE TABLE IF NOT EXISTS subcities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL COMMENT 'subcity name in English',
    name_am VARCHAR(100) NOT NULL COMMENT 'subcity name in Amharic',
    name_af VARCHAR(100) NOT NULL COMMENT 'subcity name in Afan Oromo',
    appointed_person_en VARCHAR(100) NOT NULL COMMENT 'Sector leader name in English',
    appointed_person_am VARCHAR(100) NOT NULL COMMENT 'Sector leader name in Amharic',
    appointed_person_af VARCHAR(100) NOT NULL COMMENT 'Sector leader name in Oromo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Subcity table';


-- Sector table - Multi-language support
CREATE TABLE IF NOT EXISTS sectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_en VARCHAR(100) NOT NULL COMMENT 'Sector name in English',
    name_am VARCHAR(100) NOT NULL COMMENT 'Sector name in Amharic',
    name_af VARCHAR(100) NOT NULL COMMENT 'Sector name in Afan Oromo',
    appointed_person_en VARCHAR(100) NOT NULL COMMENT 'Sector leader name in English',
    appointed_person_am VARCHAR(100) NOT NULL COMMENT 'Sector leader name in Amharic',
    appointed_person_af VARCHAR(100) NOT NULL COMMENT 'Sector leader name in Oromo',
    office_number VARCHAR(50) NOT NULL COMMENT 'Sector leader office',
    profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci 
  COMMENT='Sectors table';

-- Divisions table - Multi-language support
CREATE TABLE IF NOT EXISTS divisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL COMMENT 'Division(Director) name in English',
  name_am VARCHAR(100) NOT NULL COMMENT 'Division(Director) name in Amharic',
  name_af VARCHAR(100) NOT NULL COMMENT 'Division(Director) name in Afan Oromo',
  appointed_person_en VARCHAR(100) NOT NULL COMMENT 'division leader name in English',
  appointed_person_am VARCHAR(100) NOT NULL COMMENT 'division leader name in Amharic',
  appointed_person_af VARCHAR(100) NOT NULL COMMENT 'division leader name in Oromo',
  office_number VARCHAR(50) NOT NULL COMMENT 'Sector leader office',
  profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
  sector_id INT NULL COMMENT 'Reference to sector',
  subcity_id INT COMMENT 'Subcity jurisdiction (required for SubCity* roles, NULL for super roles)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  INDEX idx_division_sector (sector_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 

COMMENT='Divisions table';

-- Departments table - Multi-language support
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL COMMENT 'Department(team Leader) name in English',
  name_am VARCHAR(100) NOT NULL COMMENT 'Department(team Leader) name in Amharic',
  name_af VARCHAR(100) NOT NULL COMMENT 'Department(team Leader) name in Afan Oromo',
  appointed_person_en VARCHAR(100) NOT NULL COMMENT 'department leader name in English',
  appointed_person_am VARCHAR(100) NOT NULL COMMENT 'department leader name in Amharic',
  appointed_person_af VARCHAR(100) NOT NULL COMMENT 'department leader name in Oromo',
  office_number VARCHAR(50) NOT NULL COMMENT 'Sector leader office',
  profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
  sector_id INT NULL COMMENT 'References to sector',
  division_id INT NULL COMMENT 'Reference to division',
  subcity_id INT COMMENT 'Subcity jurisdiction (required for SubCity* roles, NULL for super roles)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  INDEX idx_dept_name_en (name_en),
  INDEX departments_division_id (division_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Departments table with multi-language support';

CREATE TABLE IF NOT EXISTS teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL COMMENT 'Team name in English',
  name_am VARCHAR(100) NOT NULL COMMENT 'Team name in Amharic',
  name_af VARCHAR(100) NOT NULL COMMENT 'Team name in Afan Oromo',
     appointed_person_en VARCHAR(100) NOT NULL COMMENT 'team leader name in English',
    appointed_person_am VARCHAR(100) NOT NULL COMMENT 'team leader name in Amharic',
    appointed_person_af VARCHAR(100) NOT NULL COMMENT 'team leader name in Oromo',
    office_number VARCHAR(50) NOT NULL COMMENT 'Sector leader office',
  profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
  sector_id INT NULL COMMENT 'Reference to sector',
  division_id INT NULL COMMENT 'Reference to division',
  department_id INT NULL COMMENT 'Reference to department',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    office_id INT COMMENT 'Reference to office',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_team_sector (sector_id),
  INDEX idx_team_division (division_id),
  INDEX idx_team_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Team table';


-- Offices table - Office locations within departments
CREATE TABLE IF NOT EXISTS offices (
  id INT AUTO_INCREMENT PRIMARY KEY,
   name_en VARCHAR(100) NOT NULL COMMENT 'Office name in English',
  name_am VARCHAR(100) NOT NULL COMMENT 'Office name in Amharic',
  name_af VARCHAR(100) NOT NULL COMMENT 'Office name in Afan Oromo',
 office_number VARCHAR(20) COMMENT 'Office number/identifier',
  department_id INT NOT NULL COMMENT 'Reference to department',
  sector_id INT NOT NULL COMMENT 'Reference to sector',
  division_id INT NOT NULL COMMENT 'Reference to division',
  team_id INT NOT NULL COMMENT 'Reference to teams', 
  description TEXT COMMENT 'Office description',
  floor VARCHAR(20) COMMENT 'Floor number/identifier',
  location VARCHAR(200) COMMENT 'Physical location description',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Office active status',
  phone VARCHAR(15) COMMENT 'Office direct phone',
  email VARCHAR(100) COMMENT 'Office email',
  services_offered TEXT COMMENT 'List of services offered',
  opening_hours VARCHAR(100) DEFAULT '8:00 AM - 5:00 PM' COMMENT 'Office hours',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  INDEX idx_office_dept (department_id),
  INDEX idx_office_active (is_active),
  INDEX idx_office_number (office_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Offices table with department relationships';


-- =====================================
-- ADMIN SYSTEM TABLES
-- =====================================

-- Admins table - Role-based admin access
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE COMMENT 'Admin username',
  password VARCHAR(255) NOT NULL COMMENT 'Hashed password',
  email VARCHAR(100) UNIQUE COMMENT 'Admin email address',
  role ENUM('SuperAdmin', 'SuperAdminSupporter', 'Admin', 'Editor', 'Viewer') NOT NULL COMMENT 'Admin role level (SuperAdmin > Admin > Editor > Viewer)',
  first_name VARCHAR(50) COMMENT 'Admin first name',
  last_name VARCHAR(50) COMMENT 'Admin last name',
  city VARCHAR(100) COMMENT 'City jurisdiction (optional for super roles)',
  subcity_id INT COMMENT 'Subcity jurisdiction (required for SubCity* roles, NULL for super roles)',
  department_id INT COMMENT 'Department assignment (optional)',
  sector_id INT COMMENT 'Admin sector (optional)',
  division_id INT COMMENT 'Admin division (optional)',
  phone VARCHAR(15) COMMENT 'Contact phone',
  profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
  created_by INT COMMENT 'Person who created the admin',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Admin account status',
  last_login TIMESTAMP NULL COMMENT 'Last login timestamp',
  failed_login_attempts INT DEFAULT 0 COMMENT 'Failed login counter',
  account_locked_until TIMESTAMP NULL COMMENT 'Account lock expiry',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_admin_username (username),
  INDEX idx_admin_role (role),
  INDEX idx_admin_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Admin users with role-based access control';

-- Password reset table
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

-- =====================================
-- EMPLOYEE SYSTEM TABLES
-- =====================================

-- Employees table - Multi-language employee information
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
  works_in_head_office BOOLEAN DEFAULT TRUE COMMENT 'Employee location',
  sector_id INT COMMENT 'Target sector',
   division_id INT COMMENT 'Target division',
      subcity_id INT COMMENT 'Subcity name',
  team_id INT COMMENT 'Target team',
  department_id INT COMMENT 'Reference to department',
  
  email VARCHAR(100) COMMENT 'Employee email',
  phone VARCHAR(15) COMMENT 'Employee phone',
  profile_picture VARCHAR(255) COMMENT 'Profile picture URL',
 specializations TEXT COMMENT 'Employee specializations/skills',
  years_of_service INT DEFAULT 0 COMMENT 'Years of service',
  education_level VARCHAR(100) COMMENT 'Education level',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Employee active status',
  hire_date DATE COMMENT 'Date of hire',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
   FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
     FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_emp_id (employee_id),
  INDEX idx_emp_dept (department_id), 
  INDEX idx_emp_active (is_active),
  INDEX idx_emp_name_en (first_name_en, last_name_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Employee directory with multi-language support';
-- =====================================
-- COMPLAINT SYSTEM TABLES
-- =====================================

-- Internal complaints table (Admin portal)
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Complainant Info
  complaint_name VARCHAR(100) COMMENT 'Complainant full name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Complainant phone',
  email VARCHAR(100) COMMENT 'Complainant email',
  -- Complaint Title
  title_en VARCHAR(200) COMMENT 'Complaint title in English',
  title_am VARCHAR(200) COMMENT 'Complaint title in Amharic',
  title_af VARCHAR(200) COMMENT 'Complaint title in Afan Oromo',
  -- Complaint Description
  description_en TEXT COMMENT 'Complaint description in English',
  description_am TEXT COMMENT 'Complaint description in Amharic',
  description_af TEXT COMMENT 'Complaint description in Afan Oromo',
  complaint_description TEXT COMMENT 'Complaint details (general)',
  -- Desired Action
  desired_action TEXT COMMENT 'Desired action ',
  -- Response
  response TEXT COMMENT 'Admin response ',
  -- Target Information
  department_id INT COMMENT 'Target department',
  division_id INT COMMENT 'Target division',
  sector_id INT COMMENT 'Target sector',
  employee_id INT COMMENT 'Target employee',
  team_id INT COMMENT 'Target team',
    subcity_id INT COMMENT 'Subcity name',
  office_id INT COMMENT 'Target office',
  responded_by INT COMMENT 'Admin that responded for the complaint',
  complaint_source VARCHAR(20) NOT NULL DEFAULT 'complaint' COMMENT 'Type of  complaint',
  service_type VARCHAR(100) COMMENT 'Service related to complaint',
  subcity VARCHAR(100) COMMENT 'Subcity location',
  woreda VARCHAR(100) COMMENT 'Woreda location',
  -- Complaint Classification
  complaint_type ENUM('service_quality', 'staff_behavior', 'facility_issue', 'process_delay', 'other') DEFAULT 'other',
  -- Voice Note
  voice_note VARCHAR(255) COMMENT 'Voice complaint file path',
  -- Workflow
  status ENUM('submitted', 'under review', 'investigating', 'resolved', 'closed') DEFAULT 'submitted',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  -- Admin and Resolution Info
    assigned_admin INT COMMENT 'Assigned admin for handling',
  admin_notes TEXT COMMENT 'Internal admin notes',
  resolution_summary TEXT COMMENT 'Resolution summary for citizen',
  citizen_satisfaction_rating INT COMMENT 'Citizen satisfaction (1-5)',
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE COMMENT 'Scheduled follow-up date',
  -- Timestamps
  resolved_at TIMESTAMP NULL COMMENT 'Resolution timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Foreign Keys
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_admin) REFERENCES admins(id) ON DELETE SET NULL,
   FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
   FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
   FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
   FOREIGN KEY (responded_by ) REFERENCES admins(id) ON DELETE SET NULL,
   FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  -- Indexes
  INDEX idx_pub_complaint_phone (phone_number),
  INDEX idx_pub_complaint_status (status),
  INDEX idx_pub_complaint_dept (department_id),
  INDEX idx_pub_complaint_div (division_id),
  INDEX idx_pub_complaint_sector (sector_id),
   INDEX idx_pub_complaint_office (office_id),
  INDEX idx_pub_complaint_subcity (subcity),
  INDEX idx_pub_complaint_type (complaint_type),
  INDEX idx_pub_complaint_date (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Internal complaint management system';

-- Public complaints table (Citizen portal)
CREATE TABLE IF NOT EXISTS public_complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Complainant Info
  complaint_name VARCHAR(100) COMMENT 'Complainant full name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Complainant phone',
  email VARCHAR(100) COMMENT 'Complainant email',
  -- Complaint Title
  title_en VARCHAR(200) COMMENT 'Complaint title in English',
  title_am VARCHAR(200) COMMENT 'Complaint title in Amharic',
  title_af VARCHAR(200) COMMENT 'Complaint title in Afan Oromo',
  -- Complaint Description
  description_en TEXT COMMENT 'Complaint description in English',
  description_am TEXT COMMENT 'Complaint description in Amharic',
  description_af TEXT COMMENT 'Complaint description in Afan Oromo',
  complaint_description TEXT COMMENT 'Complaint details (general)',
  -- Desired Action
  desired_action TEXT COMMENT 'Desired action ',
  -- Response
  response TEXT COMMENT 'Admin response ',
  -- Target Information
  department_id INT COMMENT 'Target department',
  division_id INT COMMENT 'Target division',
  sector_id INT COMMENT 'Target sector',
  employee_id INT COMMENT 'Target employee',
  team_id INT COMMENT 'Target team',
  subcity_id INT COMMENT 'Subcity name',
  office_id INT COMMENT 'Target office',
  responded_by INT COMMENT 'Admin that responded for the complaint',

  complaint_source VARCHAR(20) NOT NULL DEFAULT 'public_complaint' COMMENT 'Source of complaint',
  service_type VARCHAR(100) COMMENT 'Service related to complaint',
  subcity VARCHAR(100) COMMENT 'Subcity location',
  woreda VARCHAR(100) COMMENT 'Woreda location',
  -- Complaint Classification
  complaint_type ENUM('service_quality', 'staff_behavior', 'facility_issue', 'process_delay', 'other') DEFAULT 'other',
  -- Voice Note
  voice_note VARCHAR(255) COMMENT 'Voice complaint file path',
  -- Workflow
  status ENUM('submitted', 'under review', 'investigating', 'resolved', 'closed') DEFAULT 'submitted',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  -- Admin and Resolution Info
    assigned_admin INT COMMENT 'Assigned admin for handling',
  admin_notes TEXT COMMENT 'Internal admin notes',
  resolution_summary TEXT COMMENT 'Resolution summary for citizen',
  citizen_satisfaction_rating INT COMMENT 'Citizen satisfaction (1-5)',
  -- Follow-up
  follow_up_required BOOLEAN DEFAULT FALSE,
  follow_up_date DATE COMMENT 'Scheduled follow-up date',
  -- Timestamps
  resolved_at TIMESTAMP NULL COMMENT 'Resolution timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Foreign Keys
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_admin) REFERENCES admins(id) ON DELETE SET NULL,
   FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL,
  FOREIGN KEY (division_id) REFERENCES divisions(id) ON DELETE SET NULL,
   FOREIGN KEY (office_id) REFERENCES offices(id) ON DELETE SET NULL,
   FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
   FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
   FOREIGN KEY (responded_by ) REFERENCES admins(id) ON DELETE SET NULL,
  -- Indexes
  INDEX idx_pub_complaint_phone (phone_number),
  INDEX idx_pub_complaint_status (status),
  INDEX idx_pub_complaint_dept (department_id),
  INDEX idx_pub_complaint_div (division_id),
  INDEX idx_pub_complaint_sector (sector_id),
   INDEX idx_pub_complaint_office (office_id),
  INDEX idx_pub_complaint_subcity (subcity),
  INDEX idx_pub_complaint_type (complaint_type),
  INDEX idx_pub_complaint_date (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Public citizen complaint system';

CREATE TABLE IF NOT EXISTS complaint_attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL COMMENT 'Related complaint',
  file_path VARCHAR(255) NOT NULL COMMENT 'Attachment file path',
  file_type VARCHAR(100) COMMENT 'MIME type (pdf, docx, xlsx, etc.)',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES public_complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint_attachment_complaint (complaint_id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Attachments for public complaints';

-- =====================================
-- FEEDBACK SYSTEM TABLES
-- =====================================

-- Internal feedback table (Admin portal)
CREATE TABLE IF NOT EXISTS feedbacks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL COMMENT 'Feedback provider name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
  email VARCHAR(100) COMMENT 'Contact email',
  reference_number VARCHAR(255)  UNIQUE,
  sector_id INT COMMENT 'Target Sector',
  department_id INT COMMENT 'Target department',
  division_id INT COMMENT 'Target division',
  team_id INT COMMENT 'Target team',
  employee_id INT COMMENT 'Target employee',
  subcity_id INT COMMENT 'Subcity name',
  subject VARCHAR(200) NOT NULL COMMENT 'Feedback subject',
  feedback_type ENUM('suggestion', 'compliment', 'concern', 'service_improvement', 'general') DEFAULT 'general',
  feedback_text TEXT NOT NULL COMMENT 'Detailed feedback',
  subcity VARCHAR(100) COMMENT 'Subcity location',
  service_experienced VARCHAR(100) COMMENT 'Service received',
  overall_satisfaction INT COMMENT 'Overall satisfaction rating',
      feedback_source VARCHAR(20) NOT NULL DEFAULT 'public_feedback' COMMENT 'Source of feedback',
  would_recommend BOOLEAN COMMENT 'Would recommend service',
  is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous feedback flag',
  admin_response TEXT COMMENT 'Admin response to feedback',
   responded_by INT COMMENT 'Admin who responded to the feedback',
  response_date TIMESTAMP NULL COMMENT 'Response timestamp',
  status ENUM('new', 'reviewed', 'responded', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY(sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE,
     FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
 FOREIGN KEY(responded_by) REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX idx_feedback_phone (phone_number),
  INDEX idx_feedback_email (email),
  INDEX idx_feedback_subject (subject),
  INDEX idx_feedback_subcity (subcity),
  INDEX idx_feedback_service (service_experienced),
  INDEX idx_feedback_created (created_at),
  INDEX idx_feedback_response_date (response_date),
  
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_feedback_status (status),
  
  INDEX idx_feedback_satisfaction (overall_satisfaction),
  INDEX idx_feedback_recommend (would_recommend),
  INDEX idx_feedback_anonymous (is_anonymous),
  
  
  INDEX idx_feedback_dept_status (department_id, status),
  INDEX idx_feedback_type_status (feedback_type, status),
  INDEX idx_feedback_sector_date (sector_id, created_at),
  INDEX idx_feedback_employee_date (employee_id, created_at),
  INDEX idx_feedback_subcity_date (subcity, created_at),
  INDEX idx_feedback_type_satisfaction (feedback_type, overall_satisfaction),
  
  FULLTEXT INDEX idx_feedback_search (subject, feedback_text, admin_response)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Internal feedback system';

-- Public feedback table (Citizen portal)
CREATE TABLE IF NOT EXISTS public_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL COMMENT 'Feedback provider name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
  email VARCHAR(100) COMMENT 'Contact email',
  
  sector_id INT COMMENT 'Target Sector',
  department_id INT COMMENT 'Target department',
  division_id INT COMMENT 'Target division',
  team_id INT COMMENT 'Target team',
  employee_id INT COMMENT 'Target employee',
    subcity_id INT COMMENT 'Subcity name',

  subject VARCHAR(200) NOT NULL COMMENT 'Feedback subject',
  feedback_type ENUM('suggestion', 'compliment', 'concern', 'service_improvement', 'general') DEFAULT 'general',
  feedback_text TEXT NOT NULL COMMENT 'Detailed feedback',
  subcity VARCHAR(100) COMMENT 'Subcity location',
  service_experienced VARCHAR(100) COMMENT 'Service received',
  overall_satisfaction INT COMMENT 'Overall satisfaction rating',
    feedback_source VARCHAR(20) NOT NULL DEFAULT 'public_feedback' COMMENT 'Source of feedback',
  would_recommend BOOLEAN COMMENT 'Would recommend service',
  is_anonymous BOOLEAN DEFAULT FALSE COMMENT 'Anonymous feedback flag',
  admin_response TEXT COMMENT 'Admin response to feedback',
   responded_by INT COMMENT 'Admin who responded to the feedback',
  response_date TIMESTAMP NULL COMMENT 'Response timestamp',
  status ENUM('new', 'reviewed', 'responded', 'archived') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    reference_number VARCHAR(255)  UNIQUE,

  FOREIGN KEY(sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE,
 FOREIGN KEY(responded_by) REFERENCES admins(id) ON DELETE SET NULL ON UPDATE CASCADE,
   FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,

  INDEX idx_feedback_phone (phone_number),
  INDEX idx_feedback_email (email),
  INDEX idx_feedback_subject (subject),
  INDEX idx_feedback_subcity (subcity),
  INDEX idx_feedback_service (service_experienced),
  INDEX idx_feedback_created (created_at),
  INDEX idx_feedback_response_date (response_date),
  
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_feedback_status (status),
  
  INDEX idx_feedback_satisfaction (overall_satisfaction),
  INDEX idx_feedback_recommend (would_recommend),
  INDEX idx_feedback_anonymous (is_anonymous),
  
  
  INDEX idx_feedback_dept_status (department_id, status),
  INDEX idx_feedback_type_status (feedback_type, status),
  INDEX idx_feedback_sector_date (sector_id, created_at),
  INDEX idx_feedback_employee_date (employee_id, created_at),
  INDEX idx_feedback_subcity_date (subcity, created_at),
  INDEX idx_feedback_type_satisfaction (feedback_type, overall_satisfaction),
  
  FULLTEXT INDEX idx_feedback_search (subject, feedback_text, admin_response)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Public citizen feedback system';

-- =====================================
-- RATING SYSTEM TABLES
-- =====================================

-- Internal ratings table (Admin portal)
CREATE TABLE IF NOT EXISTS ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Contact information
  full_name VARCHAR(100) NOT NULL COMMENT 'Rater full name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
  -- service
  service_type VARCHAR(100) NOT NULL COMMENT 'Service being rated',
  -- service_rating INT NOT NULL DEFAULT 0 COMMENT 'Overall service rating',
  -- location
  sector_id INT COMMENT 'Sector being rated',
  division_id INT COMMENT 'Division being rated',
  department_id INT COMMENT 'Department being rated',
  employee_id INT COMMENT 'ID of the employee being rated',
  subcity_id INT  COMMENT 'Subcity location',
  -- rating
  overall_rating INT NOT NULL COMMENT 'Overall service rating',
  courtesy INT NOT NULL COMMENT 'how polite, respectful, and considerate',
  punctuality INT COMMENT 'Finishing task on time',
  knowledge INT COMMENT 'knowledge that the employee displayed',
    staff_professionalism INT COMMENT 'Staff rating',
  service_speed INT COMMENT 'Speed rating',
  facility_quality INT COMMENT 'Facility rating',
  communication_quality INT COMMENT 'Communication rating',
  -- additional information
   rating_source VARCHAR(20) NOT NULL DEFAULT 'rating' COMMENT 'Source of rating',
  additional_comments TEXT COMMENT 'Additional feedback',
  visit_date DATE COMMENT 'Service visit date',
  wait_time_minutes INT COMMENT 'Waiting time in minutes',
  issue_resolved BOOLEAN COMMENT 'Was issue resolved',
  would_recommend BOOLEAN COMMENT 'Would recommend service',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Rating verification status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY(sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE,
     FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,

  INDEX idx_pub_rating_overall (overall_rating),
  INDEX idx_pub_rating_dept (department_id),
  INDEX idx_pub_rating_service (service_type),
  INDEX idx_pub_rating_phone (phone_number),
  INDEX idx_pub_rating_employee (employee_id),
  INDEX idx_pub_rating_date (visit_date),
  INDEX idx_pub_rating_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Internal rating system';

-- Public ratings table (Citizen portal)
CREATE TABLE IF NOT EXISTS public_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  -- Contact information
  full_name VARCHAR(100) NOT NULL COMMENT 'Rater full name',
  phone_number VARCHAR(15) NOT NULL COMMENT 'Contact phone',
  -- service
  service_type VARCHAR(100) NOT NULL COMMENT 'Service being rated',
  -- service_rating INT NOT NULL DEFAULT 0 COMMENT 'Overall service rating',
  -- location
  sector_id INT COMMENT 'Sector being rated',
  division_id INT COMMENT 'Division being rated',
  department_id INT COMMENT 'Department being rated',
  employee_id INT COMMENT 'ID of the employee being rated',
  subcity_id INT COMMENT 'Subcity location',
  -- rating
  overall_rating INT NOT NULL COMMENT 'Overall service rating',
  courtesy INT NOT NULL COMMENT 'how polite, respectful, and considerate',
  punctuality INT COMMENT 'Finishing task on time',
  knowledge INT COMMENT 'knowledge that the employee displayed',
    staff_professionalism INT COMMENT 'Staff rating',
  service_speed INT COMMENT 'Speed rating',
  facility_quality INT COMMENT 'Facility rating',
  communication_quality INT COMMENT 'Communication rating',
  -- additional information
      rating_source VARCHAR(20) NOT NULL DEFAULT 'public_rating' COMMENT 'Source of rating',
  additional_comments TEXT COMMENT 'Additional feedback',
  visit_date DATE COMMENT 'Service visit date',
  wait_time_minutes INT COMMENT 'Waiting time in minutes',
  issue_resolved BOOLEAN COMMENT 'Was issue resolved',
  would_recommend BOOLEAN COMMENT 'Would recommend service',
  is_verified BOOLEAN DEFAULT FALSE COMMENT 'Rating verification status',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY(sector_id) REFERENCES sectors(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(division_id) REFERENCES divisions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(department_id) REFERENCES departments(id) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE SET NULL ON UPDATE CASCADE,
   FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL,
  INDEX idx_pub_rating_overall (overall_rating),
  INDEX idx_pub_rating_dept (department_id),
  INDEX idx_pub_rating_service (service_type),
  INDEX idx_pub_rating_phone (phone_number),
  INDEX idx_pub_rating_employee (employee_id),
  INDEX idx_pub_rating_date (visit_date),
  INDEX idx_pub_rating_verified (is_verified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='Public service rating system';

-- =====================================
-- SYSTEM MONITORING TABLES
-- =====================================

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT COMMENT 'Admin who performed action',
  action VARCHAR(100) NOT NULL COMMENT 'Action performed',
  entity_type VARCHAR(50) NOT NULL COMMENT 'Type of entity affected',
  entity_id INT COMMENT 'ID of affected entity',
  details JSON COMMENT 'Additional action details',
  sector_id INT COMMENT 'sector source for log',
  subcity_id INT COMMENT 'subcity source for log',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL,
  FOREIGN KEY (subcity_id) REFERENCES subcities(id) ON DELETE SET NULL, 
  FOREIGN KEY (sector_id) REFERENCES sectors(id) ON DELETE SET NULL, 

  INDEX idx_log_admin (admin_id),
  INDEX idx_log_action (action),
  INDEX idx_log_entity (entity_type, entity_id),
  INDEX idx_log_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci 
COMMENT='System activity logging';

-- System settings table
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

-- =====================================
-- PERFORMANCE INDEXES
-- =====================================

-- Additional performance indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status_date ON complaints(status, created_at);
CREATE INDEX IF NOT EXISTS idx_public_complaints_status_date ON public_complaints(status, created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_type_date ON feedbacks(feedback_type, created_at);
CREATE INDEX IF NOT EXISTS idx_public_feedback_type_date ON public_feedback(feedback_type, created_at);
CREATE INDEX IF NOT EXISTS idx_ratings_employee_date ON ratings(employee_id, created_at);
CREATE INDEX IF NOT EXISTS idx_public_ratings_dept_date ON public_ratings(department_id, created_at);

-- Full-text search indexes
CREATE FULLTEXT INDEX IF NOT EXISTS ft_complaint_description ON complaints(description_en, description_am, description_af);
CREATE FULLTEXT INDEX IF NOT EXISTS ft_public_complaint_description ON public_complaints(complaint_description);
CREATE FULLTEXT INDEX IF NOT EXISTS ft_feedback_comments ON feedbacks(feedback_text, subject);
CREATE FULLTEXT INDEX IF NOT EXISTS ft_public_feedback_text ON public_feedback(feedback_text, subject);
CREATE FULLTEXT INDEX IF NOT EXISTS ft_employee_names ON employees(first_name_en, middle_name_en, last_name_en);

-- =====================================
-- SAMPLE DATA INSERTION =====================================

-- Insert sample sectors
INSERT INTO sectors (
  name_en, name_am, name_af,
  appointed_person_en, appointed_person_am, appointed_person_af, office_number, profile_picture
) VALUES
('General Director', 'ዋና ዳይሬክተር', 'Daayrektara Olmaa', 'Ato Kibebew Mideksa Gutema', 'አቶ ክበበው ሚደቅሳ ጉተማ"', 'Obbo Kibebew Mideqsa Gutamaa','1',''),
('Head of Administration and Finance Office', 'የአስተዳደርና ፋይናንስ ጽ/ቤት ኃላፊ', 'I/tu Waajjira Bulchiinsaa fi Faayinaansii', 'Ms. Hawa Wabi Abdirahman', 'ወ/ሮ ሃዋ ዋቢ አብድርሃማን', 'Ad/ti Hawaa Waabii Abdirahmaan','12th floor 05',''),
('Deputy Director', 'የመንገድ ደህንነት ምህንድስና እና ፓርኪንግ ዘርፍ ም/ ዋና ዳይሬክተር ', 'Itti aanaa Daayrektara Olmaa, Damee Injinariingii fi Paarkingii Nageenya Daandii', 'Elias Zerga Melka E/R', 'ኢ/ር ኤልያስ ዘርጋ መልካ ', "Injinar Eliyas Zargaa Mal'akaa",'11th floor 02',''),
('Deputy Director, Road Safety Awareness. Fund Sector', 'የተከታዩ ዳይሬክተር', 'Daayrektara Itti Aanaa, Kutaa Beeksisawwanii… Mallaqaa', 'Ato Amare Tarekegn Metekiya', 'አቶ አማረ ታረቀኝ መተኪያ', 'Obbo Amaree Tarraqany Meetekiyaa','9th floor 02','');
-- Insert sample divisions
INSERT INTO divisions (
  name_en, name_am, name_af,
  appointed_person_en, appointed_person_am, appointed_person_af,office_number,profile_picture
,  sector_id
) VALUES
('Director of Audit Directorate III', 'የኦዲት ዳይሬክቶሬት ዳይሬክተር III', 'Daayrektara Daayrektoreetii Oditii III', 'Serke Werede Berhanu', 'ሠርኬ ወረደ ብርሀኑ', 'Obbo Sarkee Waradaa Barhaanuu','10th floor 04','', 1),

('Director, Human Resources Management Directorate III', 'የሰው ሃብት አስተዳደር ዳይሬክቶሬት ዳይሬክተር III', 'Daayrektara, Daayrektoreetii Bulchiinsa Qabeenya Namaa III', 'Girma Edosa Gemechu', 'ግርማ ኢዶሳ ገመቹ', 'Obbo Girmaa Eedoosaa Gameechuu','10th floor 06','', 2),

('Director of Finance Directorate III', 'የፋይናንስ ዳይሬክቶሬት ዳይሬክተር III', 'Daayrektara Daayrektoreetii Faayinaansii III', 'Lemma Bikila Hunde', 'ለማ ቢቂላ ሁንዴ', 'Obbo Lammaa Biqilaa Hundee','10th floor 02','', 2),

('Director of Procurement Directorate III', 'የግዥ ዳይሬክቶሬት ዳይሬክተር III', 'Daayrektoreetii Bittaa III', 'Sintayehu Merga Debele', 'ስንታየሁ መርጋ ደበሌ', 'Obbo Sintaayyahuu Margaa Dabalee','10th floor 01','', 2),

('Director', 'የፓርኪንግ፣ የመንገድ ትራፊክ መሰረተ ልማትና አስተዳደር ዳይሬክተር', "Daayrektara Paarkingii, Bu'uraalee Misoomaa fi Bulchiinsa Tiraafika Daandii", 'Ato Biniam Getachew Beshe', 'አቶ ቢኒያም ጌታቸው በሼ', 'Obbo Biniyaam Gataachaw Bashaa','11th floor 01','', 3),

('Director', 'የመንገድ ደህንነት ምህንድስና ዳይሬክተር', 'Daayrektara Injinariingii Nageenya Daandii', 'Merga Sefera Akesa E/R', 'መርጋ ሰፈራ አከሳ ኢ/ር', 'Injinar Margaa Safaraa Aqqasaa','11th floor 06','' ,3),

('Director, Road Traffic Enforcement & Control', 'ዳይሬክተር', "Daayrektara, Raawwachiisaa fi To'annoo Tiraafika Daandii", 'Ato Ayalew Atissa Guffansa', 'አያሌው አቲሳ ጉፋንሳ', 'Obbo Ayyaalaw Atiisaa Gufansaa','9th floor 04','', 4),

('Director, Road Safety Awareness & Capacity Building', 'ዳይሬክተር', "Daayrektara, Beeksisawwanii fi Ijaarsa Dandeettii Nageenya Daandii", 'Ato Berhanu Kuma Kefeni', 'አቶ ብርሃኑ ኩማ ከፈኒ', 'Obbo Barhaanuu Kumaa Kafanii','9th floor 01','', 4);

-- Insert sample departments
INSERT INTO departments (
  name_en, name_am, name_af,
  appointed_person_en, appointed_person_am, appointed_person_af,
  office_number, profile_picture,
  sector_id, division_id
) VALUES
('Audit Expert II', 'የኦዲት ባለሙያ II', 'Ogessa Oditii II',
 'Mekdes Getahun Gebrekidan', 'መቅደስ ጌታሁን ገብረኪዳን', 'Ad/ti Maqdas Gataahun Gabrakidaan',
 '10th floor 04', '', 1, 1),

('Legal Expert III', 'የህግ ባለሙያ III', 'Ogessa Seeraa III',
 'Yedelfre Tesfaye Deco', 'የድልፍሬ ተስፋዬ ዴኮ', 'Obbo Yadalfaree Tasfaayee Deeqoo',
 '12th floor 06', '', 1, 1),

('Human Resources Management Expert IV', 'የሰው ሀብት አስተዳደር ባለሙያ IV', 'Ogessa Bulchiinsa Qabeenya Namaa IV',
 'Yetnayit Girma Admasu', 'የትናየት ግርማ አድማሱ', 'Obbo Yatnaayit Girmaa Admaasuu',
 '10th floor 06', '', 2, 2),

('Human Resources Management Expert IV', 'የሰው ሀብት አስተዳደር ባለሙያ IV', 'Ogessa Bulchiinsa Qabeenya Namaa IV',
 'Teferi Duguma Merara', 'ተፈሪ ዱጉማ መራራ', 'Obbo Tafarii Duguumaa Maraaraa',
 '10th floor 06', '', 2, 2),

('Property and General Services Team Leader III', 'የንብረትና ጠቅላላ አገልግሎት ቡድን መሪ III', 'Geggeessaa Garee Qabeenyaa fi Tajaajila Waliigalaa III',
 'Mehari Lelore Tbamo', 'መሓሪ ለዕሎሬ ጥባሞ', "Obbo Mahaarii La'looree Xibaamoo",
 '10th floor 05', '', 2, 2),

('Team Leader for parking', 'የፓርኪንግ ጥናት ቡድን መሪ', 'Hogganaa Garee Qorannoo Paarkingii',
 'Ato Solomon Kebede Balcha', 'አቶ ሰለሞን ከበደ ባልቻ', 'Obbo Solomoon Kabadaa Baalchaa',
 '11th floor 01', '', 3, 5),

('Expert at parking studies', 'የፓርኪንግ ጥናት ባለሙያ IV', 'Ogessa Qorannoo Paarkingii IV',
 'Qannew Asfaw Hailemariam', 'ቃኘው አስፋው ኃይለማሪያም', 'Obbo Qannyaw Asfaaw Haylamaariyaam',
 '11th floor 01', '', 3, 6),

('Team Leader for parking', 'የፓርኪንግ አስተዳደር ቡድን መሪ', 'Hogganaa Garee Bulchiinsa Paarkingii',
 'Embeth Tsegaye Gebre Michael', 'እመቤት ፀጋዬ ገ/ሚካኤል', "Ad/ti Imbat Tsaggayee Gabra Mikaa'el",
 '11th floor 01', '', 3, 7),

('Head of Road Traffic Enforcement & Control Team', 'ቡድን መሪ', "Hogganaa Garee Raawwachiisaa fi To'annoo Tiraafika Daandii",
 'Ato Dereje Werku Mersha', 'ደረጀ ወርቁ መርሻ', 'Obbo Darajjee Warquu Marsha',
 '9th floor 04', '', 4, 8),

('Electronic Media Awareness Specialist III', 'የኤሌክትሮኒክስ ሚዲያ ግንዛቤ ባለሙያ III', "Ogummaa III Beeksisawwan Miidiyaa Elektrooniksii",
 'Meseret Getu Woldetensay', 'መሰረት ጌቱ ወልደተንሳይ', 'Addee Masarat Geetuu Waldatansaay',
 '9th floor 01', '', 4, 8);
-- Insert into subcities
INSERT INTO subcities (
    name_en, 
    name_am, 
    name_af, 
    appointed_person_en, 
    appointed_person_am, 
    appointed_person_af
) VALUES
    ('Addis Ketema', 'አዲስ ከተማ', 'Adaama Ketema', 'Abebe Tesfaye', 'አበበ ተስፋዬ', 'Abebe Tesfaye'),
    ('Akaki Kaliti', 'አቃቂ ቃሊቲ', 'Aqaqii Qaalitii', 'Mulugeta Kebede', 'ሙሉጌታ ከበደ', 'Mulugeta Kebede'),
    ('Arada', 'አራዳ', 'Aradaa', 'Selamawit Asfaw', 'ሰላማዊት አስፋው', 'Salaamawit Asfaw'),
    ('Bole', 'ቦሌ', 'Bolee', 'Tsegaye Lemma', 'ፀጋዬ ለማ', 'Segaaye Lemma'),
    ('Kirkos', 'ቂርቆስ', 'Qirkos', 'Hiwot Alemayehu', 'ህይወት አለማየሁ', 'Hiwot Alemayehu'),
    ('Lideta', 'ልደታ', 'Lidetaa', 'Getachew Yilma', 'ጌታቸው ይልማ', 'Getachew Yilma'),
    ('Nifas Silk Lafto', 'ንፋስ ስልክ ላፍቶ', 'Nifaas Silkii Laftoo', 'Aster Bekele', 'አስቴር በቀለ', 'Aster Bekele'),
    ('Yeka', 'የካ', 'Yekaa', 'Belaynesh Tadesse', 'በላይነሽ ታደሰ', 'Belaynesh Tadesse'),
    ('Lemi Kura', 'ለሚ ኩራ', 'Lemi Kuraa', 'Dawit Gebre', 'ዳዊት ገብሬ', 'Dawit Gebre'),
    ('Gulele', 'ጉለሌ', 'Gulele', 'Eyerusalem Teshome', 'ኤየሩሳሌም ተሾመ', 'Eyerusalem Teshome'),
    ('Kolfe Keranio', 'ኮልፌ ቀራንዮ', 'Koolfee Qeraaniyoo', 'Fikru Desta', 'ፍቅሩ ደስታ', 'Fikru Desta');


-- Insert sample teams 
INSERT INTO teams (
  name_en, name_am, name_af,
  appointed_person_en, appointed_person_am, appointed_person_af,office_number,profile_picture,
  sector_id, division_id, department_id
) VALUES
('Property Registration Control Staff II', 'የንብረት ምዝገባ ቁጥጥር ሠራተኛ II', "Hojjatoota Galmee To'annoo Qabeenyaa II", 'Bereket Mekonnen W/Yohannes', 'በረከት መኮንን ወ/ዮሐንስ', 'Ad/ti Barakat Makonnin W/Yoohannis','10th floor 05','', 2, 3, 5),
('Network Administration', 'የኔትዎርክ አስተዳደር', 'Bulchiinsa Network', 'Rahwa Kidane', 'ራህዋ ኪዳኔ', 'Rahwa Kidane',"10th floor -6",'', 1, 1, 1),
('Payroll', 'የደመወዝ ክፍያ', 'Mindaa fi Kaffaltii', 'Amare Gutu', 'አማረ ጉቱ', 'Amare Gutu','10th floor 06','', 3, 3, 3),
('Media Relations', 'የሚዲያ ግንኙነት', 'Hariiroo Miidiyaa', 'Rediet Habtamu', 'ረድያት ሐብታሙ', 'Rediet Habtamu','10th floor 07','', 3, 4, 4),
('Customer Feedback', 'የደንበኛ አስተያየት', 'Yaada Maamilaa', 'Dereje Shibru', 'ደረጀ ሽብሩ', 'Dereje Shibru','10th floor 02','', 2, 2, 2),
('Traffic Signal Management', 'የትራፊክ ምልክት አስተዳደር', 'Bulchiinsa Mallattoo Tirafiika', 'Betelhem Mulu', 'ቤተልሄም ሙሉ', 'Betelhem Mulu','10th floor 12','', 1, 3, 2),
('License Issuance', 'የፈቃድ ማውጣት', 'Kenninsa Laysinsii', 'Biniam Terefe', 'ቢንያም ተረፈ', 'Biniam Terefe','10th floor 10',
  '',2, 3, 5),
('Road Design Team', 'የመንገድ ዲዛይን ቡድን', 'Team Dizaayina Daandii', 'Yohannes Desta', 'ዮሐንስ ደስታ', 'Yohannes Desta','10th floor 12','', 1, 3, 4),
('Compliance Monitoring', 'የተገዢነት ቁጥጥር', 'Ilaalcha Walqixxummaa', 'Kalkidan Getnet', 'ካልኪዳን ጌትነት', 'Kalkidan Getnet','10th floor 013',
'',2,3 , 5),
('Data Analytics', 'የውሂብ ትንታኔ', 'Xiinxala Deetaa', 'Abel Samuel', 'አቤል ሳሙኤል', 'Abel Samuel','08th floor 5','', 2, 2, 2);

-- Insert sample admin users
INSERT INTO admins (
  username,
  password,
  email,
  role,
  first_name,
  last_name,
  city,
  subcity_id,
  department_id,
  sector_id,
  division_id,
  created_by,
  is_active
) VALUES
('superadmin', '$2a$12$QlsLpEn3.8L1/v9EJBB5IudumlCbC8bxWdPno4hb.90VPw1qZvLlC',
 'admin@office.gov.et', 'SuperAdmin', 'System', 'Administrator', 'Addis Ababa', 1, 1, NULL, NULL, NULL, TRUE),

('super_support', '$2a$12$QlsLpEn3.8L1/v9EJBB5IudumlCbC8bxWdPno4hb.90VPw1qZvLlC',
 'support@office.gov.et', 'Admin', 'Support', 'Team', 'Addis Ababa', NULL, 1, 2, NULL, 1, TRUE),

('bole_admin', '$2a$12$QlsLpEn3.8L1/v9EJBB5IudumlCbC8bxWdPno4hb.90VPw1qZvLlC',
 'bole@office.gov.et', 'Admin', 'Bole', 'Admin', 'Addis Ababa', 5, 2, 3, NULL, 2, TRUE),

('kirkos_admin', '$2a$12$QlsLpEn3.8L1/v9EJBB5IudumlCbC8bxWdPno4hb.90VPw1qZvLlC',
 'kirkos@office.gov.et', 'Admin', 'Kirkos', 'Admin', 'Addis Ababa', 8, 2, 4, NULL, 2, TRUE),

('bole_support', '$2a$12$QlsLpEn3.8L1/v9EJBB5IudumlCbC8bxWdPno4hb.90VPw1qZvLlC',
 'bole.support@office.gov.et', 'Editor', 'Bole', 'Support', 'Addis Ababa', 5, 2, 3, NULL, 3, TRUE);

INSERT INTO offices (
  name_en, name_am, name_af, office_number,
  department_id, sector_id, division_id, team_id,
  description, floor, location,
  phone, email, services_offered
) VALUES
(
  'IT Support Office', 'የ IT ድጋፍ ጽ/ቤት', 'Waajjira Deeggarsa IT', 'IT-101',
  1, 1, 1, 1,
  'Technical support and IT services', '1st Floor', 'Building A, Room 101',
  '+251911100001', 'support@office.gov.et', 'Hardware support, Software installation, Network troubleshooting'
),
(
  'HR Services Office', 'የሰው ሃይል አገልግሎት ጽ/ቤት', 'Waajjira Tajaajila HR', 'HR-201',
  2, 2, 2, 2,
  'Human resources services and employee support', '2nd Floor', 'Building B, Room 201',
  '+251911100002', 'hrservices@office.gov.et', 'Employee registration, Benefits administration, Training coordination'
),
(
  'Finance Office', 'የፋይናንስ ጽ/ቤት', 'Waajjira Faayinaansii', 'FIN-301',
  3, 3, 3, 3,
  'Financial services and budget management', '3rd Floor', 'Building C, Room 301',
  '+251911100003', 'finance@office.gov.et', 'Budget planning, Payment processing, Financial reporting'
),
(
  'Public Information Desk', 'የህዝብ መረጃ ጠረጴዛ', 'Teessoo Odeeffannoo Uummataaf', 'PR-401',
  4, 4, 4, 4,
  'Public information and communication services', 'Ground Floor', 'Building A, Lobby',
  '+251911100004', 'info@office.gov.et', 'Information provision, Document requests, Public inquiries'
),
(
  'Legal Affairs Office', 'የህግ ጉዳይ ጽ/ቤት', 'Waajjira Dhimmoota Seeraa', 'LAW-501',
  1, 1, 1, 1,
  'Legal advisory and compliance services', '5th Floor', 'Building D, Room 501',
  '+251911100005', 'legal@office.gov.et', 'Contract review, Legal consultation, Policy drafting'
),
(
  'Procurement Office', 'የግዢ ጽ/ቤት', 'Waajjira Bittaa', 'PROC-601',
    2, 2, 2, 2,
  'Procurement and supply chain management', '6th Floor', 'Building E, Room 601',
  '+251911100006', 'procurement@office.gov.et', 'Supplier management, Tendering, Purchase processing'
),
(
  'Research and Development Office', 'የምርምር እና ልማት ጽ/ቤት', 'Waajjira Qorannoo fi Hirmaachisaa', 'RND-701',
    3, 3, 3, 3,
  'Innovation, research, and development activities', '7th Floor', 'Building F, Room 701',
  '+251911100007', 'rnd@office.gov.et', 'Research projects, Product development, Data analysis'
),
(
  'Logistics Office', 'የትራንስፖርት እና አቅርቦት ጽ/ቤት', 'Waajjira Geejjibaa fi Qindeessaa', 'LOG-801',
    4, 4, 4, 4,
  'Transportation and logistics services', '8th Floor', 'Building G, Room 801',
  '+251911100008', 'logistics@office.gov.et', 'Fleet management, Delivery scheduling, Supply coordination'
),
(
  'Training and Capacity Building Office', 'የስልጠና እና አቅም መገንቢያ ጽ/ቤት', 'Waajjira Leenjii fi Dandeettii Uumuu', 'TRN-901',
    3, 3, 3, 3,
  'Staff training and development services', '9th Floor', 'Building H, Room 901',
  '+251911100009', 'training@office.gov.et', 'Workshops, Skills development, Leadership programs'
);
-- Insert sample employees
INSERT INTO employees (
  employee_id, first_name_en, first_name_am, first_name_af,
  middle_name_en, middle_name_am, middle_name_af,
  last_name_en, last_name_am, last_name_af,
  office_id, office_number, floor_number,
  position_en, position_am, position_af,
  sector_id, division_id, subcity_id, team_id, department_id,
  email, phone, profile_picture,
  specializations, years_of_service, education_level,
  is_active,works_in_head_office, hire_date, created_at, updated_at
) VALUES
('EMP001', 'Abebe', 'አበበ', 'Abebee',
 'Tadesse', 'ታደሰ', 'Taddasaa',
 'Kebede', 'ከበደ', 'Kebede',
 1, 'IT-101', 1,
 'IT Specialist', 'የአይቲ ስፔሻሊስት', 'Xinxalaa IT',
 1, 3, 1, 4, 2,
 'abebe.kebede@office.gov.et', '+251911200001', 'abebe.jpg',
 'Networking, Cybersecurity', 2, 'MSc in Computer Science',
 TRUE,TRUE, '2023-01-15', NOW(), NOW()),

('EMP002', 'Selam', 'ሰላም', 'Salaam',
 'Mulu', 'ሙሉ', 'Muluu',
 'Tesfaye', 'ተስፋዬ', 'Tesfaye',
 2, 'HR-201', 2,
 'HR Coordinator', 'የሰው ሃይል አስተባባሪ', 'Tajaajila HR',
 2, 1, 3, 4,5,
 'selam.tesfaye@office.gov.et', '+251911200002', 'selam.jpg',
 'Recruitment, Training', 3, 'BA in Human Resources',
 TRUE,False, '2022-06-01', NOW(), NOW()),

('EMP003', 'Tigist', 'ትግስት', 'Tigist',
 'Alem', 'አለም', 'Alemuu',
 'Alemu', 'አለሙ', 'Alemuu',
 3, 'FIN-301', 3,
 'Financial Analyst', 'የፋይናንስ ተንታኝ', 'Xinxalaa Faayinaansii',
 2, 2, 2, 2,1,
 'tigist.alemu@office.gov.et', '+251911200003', 'tigist.jpg',
 'Budgeting, Financial Reporting', 4, 'MBA in Finance',
 TRUE, TRUE,'2021-03-10', NOW(), NOW());


SET FOREIGN_KEY_CHECKS = 1;


-- =====================================
-- IMPORTANT NOTES FOR HOSTING
-- =====================================

/*
DEPLOYMENT CHECKLIST:

1. DATABASE SETUP:
   - Create a new MySQL database on your hosting server
   - Copy and paste this ENTIRE script into your database manager
   - Execute the script to create all tables and sample data

2. ENVIRONMENT CONFIGURATION:
   Create a .env file in your application root with these variables:
   
   NODE_ENV=production
   PORT=4000
   
   # Database Configuration
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_username
   DB_PASSWORD=your_database_password
   
   # Security
   JWT_SECRET=your_jwt_secret_key_here
   
   # CORS Origins (add your frontend domain)
   ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

3. DEFAULT ADMIN CREDENTIALS:
   - Username: superadmin
   - Password: password123
   - Email: admin@office.gov.et
   
   ⚠️ IMPORTANT: Change the default password immediately after first login!

4. FILE UPLOAD DIRECTORIES:
   Ensure these directories exist and are writable:
   - /Uploads/voice_complaints/
   - /Uploads/profile_pictures/

5. FEATURES INCLUDED:
   ✅ Multi-language support (English, Amharic, Afan Oromo)
   ✅ Role-based admin access control
   ✅ Public citizen complaint system
   ✅ Service rating and feedback system
   ✅ Employee directory
   ✅ File upload support
   ✅ Performance-optimized indexes
   ✅ Full-text search capabilities

6. API ENDPOINTS:
   Admin Portal: /api/admin/
   Public Portal: /api/
   Health Check: /health

7. SECURITY FEATURES:
   ✅ Password hashing with bcrypt
   ✅ JWT token authentication
   ✅ Input validation and sanitization
   ✅ Rate limiting
   ✅ CORS protection
   ✅ SQL injection prevention

8. PRODUCTION OPTIMIZATION:
   ✅ Database indexes for performance
   ✅ Compressed responses
   ✅ Security headers with Helmet
   ✅ Optimized queries
   ✅ Error handling and logging
*/
