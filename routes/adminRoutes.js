const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { authenticateToken, restrictTo } = require('../middleware/auth');

const {
  adminLogin,
  getAdmins,
  createAdmin,
  updateAdmin,
  updateSuperAdmin,
  requestPasswordReset,
  resetPassword,
  getStatistics,
  getDepartments,
  logAdmins,
  exportReport,
  exportSubcity,
  exportEmployees,
  exportComplaints,
  exportFeedback,
  getComplaintTrends,
  getLocationHierarchy,
  getStatisticsWithLocation,
  getRatingsAdmin,
  getPublicRatingsAdmin,
  respondToFeedback,
  respondToPublicFeedback,
  deleteAdmin,
} = require('../controllers/adminController');

const {
  getEmployeesAdmin,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employeeController');

const { getComplaintsAdmin, resolveComplaint } = require('../controllers/complaintController');

const { getFeedbackAdmin } = require('../controllers/feedbackController');

const publicAdminController = require('../controllers/publicAdminController');
const { deleteSector, createSector, updateSector } = require('../controllers/SectorController');
const {
  createDivision,
  deleteDivision,
  updateDivision,
} = require('../controllers/divisionController');
const {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} = require('../controllers/departmentController');
const { createSubcity, deleteSubcity, updateSubcity } = require('../controllers/SubcityController');
const { getNotifications } = require('../controllers/notificationController');

// Authentication routes
router.post('/login', adminLogin);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

// Admin management routes (SuperAdmin only)
router.get(
  '/',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  getAdmins
);
router.post(
  '/',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  createAdmin
);
router.put(
  '/',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  updateAdmin
);
router.put(
  '/self-update',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  updateSuperAdmin
);

router.delete(
  '/',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  deleteAdmin
);
router.get(
  '/log-admins',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Editor'),
  logAdmins
);

//sectors
router.post(
  '/sectors',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  createSector
);
router.put(
  '/sectors',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  updateSector
);
router.delete(
  '/sectors',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  deleteSector
);
//division
router.post(
  '/division',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  createDivision
);
router.delete(
  '/division',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  deleteDivision
);
(restrictTo('SuperAdmin', 'Admin'),
  router.put(
    '/division',
    authenticateToken,
    restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
    upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
    updateDivision
  ));

//departments
router.post(
  '/department',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  createDepartment
);

router.delete(
  '/department',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  deleteDepartment
);
router.put(
  '/department',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  updateDepartment
);
router.put(
  '/subcities',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter'),
  updateSubcity
);
router.delete(
  '/subcities',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter'),
  deleteSubcity
);
router.post(
  '/subcities',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter'),
  createSubcity
);

// Employee management routes (Admin access required)
router.get(
  '/employees',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  getEmployeesAdmin
);
router.post(
  '/employees',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  createEmployee
);
router.put(
  '/employees',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  upload.fields([{ name: 'profile_picture', maxCount: 1 }]),
  updateEmployee
);
router.delete(
  '/employees/:id',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  deleteEmployee
);

// Employee hierarchy filtering routes
router.use('/employees', require('./employeeHierarchy'));

// Complaint management routes
router.get(
  '/complaints',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getComplaintsAdmin
);
router.get(
  '/complaints/trends',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getComplaintTrends
);
router.put(
  '/complaints/:id/resolve',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  resolveComplaint
);

// Feedback management routes
router.get(
  '/feedback',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getFeedbackAdmin
);

router.put(
  '/feedback/:id/respond',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  respondToFeedback
);
router.put(
  'public/feedback/:id/respond',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  respondToPublicFeedback
);

// Ratings management routes
router.get(
  '/ratings',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  getRatingsAdmin
);
router.get(
  '/public/ratings',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  getPublicRatingsAdmin
);

// Statistics and reports
router.get(
  '/statistics',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  getStatistics
);
router.get(
  '/export-report',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  exportReport
);
router.get(
  '/export-subcity',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  exportSubcity
);

//notifications
router.get(
  '/notifications',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getNotifications
);
// Specific export routes
router.get(
  '/employees/export',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  exportEmployees
);
router.get(
  '/complaints/export',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  exportComplaints
);
router.get(
  '/feedback/export',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  exportFeedback
);

// Utility routes
router.get('/departments', authenticateToken, restrictTo('SuperAdmin', 'Admin'), getDepartments);

// New hierarchical location routes
router.get(
  '/location-hierarchy',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getLocationHierarchy
);

router.get(
  '/statistics-location',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  getStatisticsWithLocation
);

// =================================
// PUBLIC CITIZEN SUBMISSIONS MANAGEMENT
// =================================

// Public Complaints Management
router.get(
  '/public/complaints',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getPublicComplaints
);

router.get(
  '/public/complaints/:id',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getPublicComplaint
);

router.put(
  '/public/complaints/:id/status',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  publicAdminController.updateComplaintStatus
);

router.post(
  '/public/complaints/:id/response',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  publicAdminController.addComplaintResponse
);

// Public Ratings Management
router.get(
  '/public/ratings',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getPublicRatings
);

router.get(
  '/public/ratings/analytics',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getRatingsAnalytics
);

// Public Feedback Management
router.get(
  '/public/feedback',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getPublicFeedback
);

router.post(
  '/public/feedback/:id/response',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  publicAdminController.respondToFeedback
);
router.put(
  '/public/feedback/:id/respond',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  respondToPublicFeedback
);

router.put(
  '/public/feedback/:id/status',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  publicAdminController.updateFeedbackStatus
);

// Department & Office Management
router.post(
  '/public/departments',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor'),
  publicAdminController.createDepartment
);

router.post(
  '/public/offices',
  authenticateToken,
  restrictTo('SuperAdmin', 'Admin'),
  publicAdminController.createOffice
);

// Dashboard Statistics for Public Data
router.get(
  '/public/dashboard-stats',
  authenticateToken,
  restrictTo('SuperAdmin', 'SuperAdminSuppoerter', 'Admin', 'Editor', 'Viewer'),
  publicAdminController.getDashboardStats
);

module.exports = router;
