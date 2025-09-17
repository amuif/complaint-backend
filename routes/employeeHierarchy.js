const express = require('express');
const router = express.Router();
const { authenticateToken, restrictTo } = require('../middleware/auth');
const employeeHierarchyController = require('../controllers/employeeHierarchyController');

/**
 * Employee Hierarchy Routes
 * All routes require authentication and appropriate admin roles
 */

/**
 * @route   GET /api/admin/employees/sector/:sectorId
 * @desc    Get all employees in a specific sector
 * @access  Private (Admin roles)
 * @params  sectorId - ID of the sector
 * @query   lang, page, limit
 */
router.get(
  '/sector/:sectorId',
  authenticateToken,
  restrictTo('SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin'),
  employeeHierarchyController.getEmployeesBySector
);

/**
 * @route   GET /api/admin/employees/division/:divisionId
 * @desc    Get all employees in a specific division
 * @access  Private (Admin roles)
 * @params  divisionId - ID of the division
 * @query   lang, page, limit
 */
router.get(
  '/division/:divisionId',
  authenticateToken,
  restrictTo('SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin'),
  employeeHierarchyController.getEmployeesByDivision
);

/**
 * @route   GET /api/admin/employees/department/:departmentId
 * @desc    Get all employees in a specific department
 * @access  Private (Admin roles)
 * @params  departmentId - ID of the department
 * @query   lang, page, limit
 */
router.get(
  '/department/:departmentId',
  authenticateToken,
  restrictTo('SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin'),
  employeeHierarchyController.getEmployeesByDepartment
);

/**
 * @route   GET /api/admin/employees/team/:teamId
 * @desc    Get all employees in a specific team
 * @access  Private (Admin roles)
 * @params  teamId - ID of the team
 * @query   lang, page, limit
 */
router.get(
  '/team/:teamId',
  authenticateToken,
  restrictTo('SuperAdmin', 'CityAdmin', 'SubCityAdmin', 'Admin'),
  employeeHierarchyController.getEmployeesByTeam
);

module.exports = router;
