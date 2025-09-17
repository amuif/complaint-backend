/**
 * =====================================
 * COMPLAINT HIERARCHY ROUTES
 * =====================================
 * Routes for filtering complaints by organizational hierarchy
 */

const express = require('express');
const router = express.Router();
const complaintHierarchyController = require('../controllers/complaintHierarchyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// =====================================
// COMPLAINT HIERARCHY FILTERING ROUTES
// =====================================

/**
 * @route   GET /api/complaints/hierarchy/sector/:sectorId
 * @desc    Get all complaints for a specific sector
 * @access  Private (Admin roles)
 * @params  sectorId - ID of the sector
 * @query   page, limit, status, type (internal/public/all)
 */
router.get(
  '/sector/:sectorId',
  authenticateToken,
  authorizeRoles(['SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin']),
  complaintHierarchyController.getComplaintsBySector
);

/**
 * @route   GET /api/complaints/hierarchy/division/:divisionId
 * @desc    Get all complaints for a specific division
 * @access  Private (Admin roles)
 * @params  divisionId - ID of the division
 * @query   page, limit, status, type (internal/public/all)
 */
router.get(
  '/division/:divisionId',
  authenticateToken,
  authorizeRoles(['SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin']),
  complaintHierarchyController.getComplaintsByDivision
);

/**
 * @route   GET /api/complaints/hierarchy/department/:departmentId
 * @desc    Get all complaints for a specific department
 * @access  Private (Admin roles)
 * @params  departmentId - ID of the department
 * @query   page, limit, status, type (internal/public/all)
 */
router.get(
  '/department/:departmentId',
  authenticateToken,
  authorizeRoles(['SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin']),
  complaintHierarchyController.getComplaintsByDepartment
);

/**
 * @route   GET /api/complaints/hierarchy/team/:teamId
 * @desc    Get all complaints for a specific team
 * @access  Private (Admin roles)
 * @params  teamId - ID of the team
 * @query   page, limit, status, type (internal/public/all)
 */
router.get(
  '/team/:teamId',
  authenticateToken,
  authorizeRoles(['SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin']),
  complaintHierarchyController.getComplaintsByTeam
);

module.exports = router;
