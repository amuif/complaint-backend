const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');
const rateLimit = require('express-rate-limit');

// Rate limiting for public endpoints
const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes per IP
  message: {
    success: false,
    message: 'Too many requests, please try again later',
  },
});

const submissionRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 submissions per hour per IP
  message: {
    success: false,
    message: 'Too many submissions, please try again later',
  },
});

// Apply rate limiting to all public routes
// router.use(publicRateLimit);

// =================================
// SYSTEM INFO & CONFIGURATION
// =================================

// Get departments for dropdowns based on frontend hierarchy
// Get all sectors(sector leader)
router.get('/sectors', publicController.getSectors);

// Get divisions by sector(director in frontend)
router.get('/sectors/:sectorId/divisions', publicController.getDivisionsBySector);

// Get departments by division(team leader in frontend)
router.get('/divisions/:divisionId/departments', publicController.getDepartmentsByDivision);

// Get teams by department(expertise in frontend)
router.get('/departments/:departmentId/teams', publicController.getTeamsByDepartment);

router.get('/departments', publicController.getDepartments);

// Get all subcities
router.get('/subcities', publicController.getSubcities);

// Get offices by department
router.get('/departments/:departmentId/offices', publicController.getOfficesByDepartment);

// Get employees by department (for rating selection)
router.get('/departments/:departmentId/employees', publicController.getEmployeesByDepartment);
// Get all divisions
router.get('/divisions', publicController.getDivisions);

// Get all departments
router.get('/departments', publicController.getDepartments);

// Get all teams
router.get('/teams', publicController.getTeams);

// Get employees with organizational hierarchy
router.get('/employees/hierarchy', publicController.getEmployeesWithHierarchy);

// Get employees by organizational hierarchy levels
router.get('/sectors/:sectorId/employees', publicController.getEmployeesBySector);
router.get('/divisions/:divisionId/employees', publicController.getEmployeesByDivision);
router.get('/departments/:departmentId/employees', publicController.getEmployeesByDepartmentId);
router.get('/teams/:teamId/employees', publicController.getEmployeesByTeam);

// =================================
// COMPLAINT MANAGEMENT
// =================================

// Submit text complaint
router.post(
  '/complaints/submit',
  // submissionRateLimit,
  publicController.submitComplaint
);

// Submit voice complaint
router.post(
  '/complaints/submit-voice',
  // submissionRateLimit,
  publicController.submitVoiceComplaint
);

// Track complaint by tracking code or phone number
router.get('/complaints/track/:identifier', publicController.trackComplaint);

// =================================
// SERVICE RATINGS
// =================================

// Submit service rating
router.post(
  '/ratings/submit',
  // submissionRateLimit,
  publicController.submitRating
);

// Get department ratings summary (public stats)
router.get('/ratings/department/:department', publicController.getDepartmentRatings);

// =================================
// GENERAL FEEDBACK
// =================================

// Submit general feedback
router.post(
  '/feedback/submit',
  // submissionRateLimit,
  publicController.submitFeedback
);

// Check feedback status by reference number
router.get('/feedback/status/:referenceNumber', publicController.checkFeedbackStatus);

// =================================
// TEAM/STAFF DIRECTORY
// =================================

// Get team members (public directory)
router.get('/team', publicController.getTeamMembers);

// Get individual team member details
router.get('/team/:employeeId', publicController.getTeamMember);

// =================================
// PUBLIC STATISTICS (Read-only)
// =================================

// Get public statistics summary
router.get('/statistics', async (req, res) => {
  try {
    const { PublicComplaint, PublicRating, PublicFeedback } = require('../models');

    // Get basic statistics
    const [totalComplaints, resolvedComplaints, totalRatings, totalFeedback] = await Promise.all([
      PublicComplaint.count(),
      PublicComplaint.count({ where: { status: 'resolved' } }),
      PublicRating.count(),
      PublicFeedback.count(),
    ]);

    // Get average rating
    const ratings = await PublicRating.findAll({
      attributes: ['overall_rating'],
    });

    const averageRating =
      ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length).toFixed(1)
        : 0;

    // Resolution rate
    const resolutionRate =
      totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        complaints: {
          total: totalComplaints,
          resolved: resolvedComplaints,
          resolution_rate: `${resolutionRate}%`,
        },
        ratings: {
          total: totalRatings,
          average_score: averageRating,
        },
        feedback: {
          total: totalFeedback,
        },
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
    });
  }
});

// =================================
// HEALTH CHECK FOR PUBLIC SERVICES
// =================================

router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Public services are operational',
    timestamp: new Date().toISOString(),
    services: {
      complaints: '✅ Available',
      ratings: '✅ Available',
      feedback: '✅ Available',
      team_directory: '✅ Available',
    },
  });
});

module.exports = router;
