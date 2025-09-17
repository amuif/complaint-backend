const { Employee, Sector, Division, Department, Team } = require('../models');
const { validateLanguage } = require('../utils/helpers');

/**
 * Employee Hierarchy Controller
 * Handles filtering employees by organizational hierarchy levels
 */

const employeeHierarchyController = {
  /**
   * Get all employees in a specific sector
   * @route GET /api/admin/employees/sector/:sectorId
   */
  getEmployeesBySector: async (req, res) => {
    try {
      const { sectorId } = req.params;
      const { lang = 'en', page = 1, limit = 50 } = req.query;
      const admin = req.user;

      if (!validateLanguage(lang)) {
        return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
      }

      // Verify sector exists
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({ message: 'Sector not found' });
      }

      const offset = (page - 1) * limit;
      let where = { sector_id: sectorId };

      // Apply role-based filtering
      if (admin.role === 'Admin') {
        where[`department_${lang}`] = admin.department;
      } else if (admin.role === 'SubCityAdmin') {
        where.city = admin.city;
        where.subcity = admin.subcity;
      } else if (admin.role === 'CityAdmin') {
        where.city = admin.city;
      }

      const employees = await Employee.findAndCountAll({
        where,
        attributes: [
          'id',
          [`first_name_${lang}`, 'first_name'],
          [`middle_name_${lang}`, 'middle_name'],
          [`last_name_${lang}`, 'last_name'],
          'office_number',
          'floor_number',
          [`position_${lang}`, 'position'],
          [`department_${lang}`, 'department'],
          'section',
          'city',
          'subcity',
          'profile_picture',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
          'created_at',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_en', 'name_af', 'name_am'],
            required: false,
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Add profile picture URLs and hierarchy information
      const employeesWithDetails = employees.rows.map((employee) => ({
        ...employee.toJSON(),
        profile_picture: employee.profile_picture
          ? `/Uploads/profile_pictures/${employee.profile_picture}`
          : null,
        hierarchy: {
          sector: employee.sector || null,
          division: employee.division || null,
          department: employee.employeeDepartment || null,
          team: employee.team || null,
        },
      }));

      res.json({
        message: 'Employees retrieved successfully',
        employees: employeesWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(employees.count / limit),
          totalItems: employees.count,
          itemsPerPage: parseInt(limit),
        },
        sector: {
          id: sector.id,
          name: sector.name,
        },
      });
    } catch (error) {
      console.error('Error fetching employees by sector:', error);
      res.status(500).json({
        message: 'Error fetching employees',
        error: error.message,
      });
    }
  },

  /**
   * Get all employees in a specific division
   * @route GET /api/admin/employees/division/:divisionId
   */
  getEmployeesByDivision: async (req, res) => {
    try {
      const { divisionId } = req.params;
      const { lang = 'en', page = 1, limit = 50 } = req.query;
      const admin = req.user;

      if (!validateLanguage(lang)) {
        return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
      }

      // Verify division exists and get sector info
      const division = await Division.findByPk(divisionId, {
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_en', 'name_am', 'name_af'],
          },
        ],
      });

      if (!division) {
        return res.status(404).json({ message: 'Division not found' });
      }

      const offset = (page - 1) * limit;
      let where = { division_id: divisionId };

      // Apply role-based filtering
      if (admin.role === 'Admin') {
        where[`department_${lang}`] = admin.department;
      } else if (admin.role === 'SubCityAdmin') {
        where.city = admin.city;
        where.subcity = admin.subcity;
      } else if (admin.role === 'CityAdmin') {
        where.city = admin.city;
      }

      const employees = await Employee.findAndCountAll({
        where,
        attributes: [
          'id',
          [`first_name_${lang}`, 'first_name'],
          [`middle_name_${lang}`, 'middle_name'],
          [`last_name_${lang}`, 'last_name'],
          'office_number',
          'floor_number',
          [`position_${lang}`, 'position'],
          [`department_${lang}`, 'department'],
          'section',
          'city',
          'subcity',
          'profile_picture',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
          'created_at',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_en', 'name_am', 'name_af'],
            required: false,
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Add profile picture URLs and hierarchy information
      const employeesWithDetails = employees.rows.map((employee) => ({
        ...employee.toJSON(),
        profile_picture: employee.profile_picture
          ? `/Uploads/profile_pictures/${employee.profile_picture}`
          : null,
        hierarchy: {
          sector: employee.sector || null,
          division: employee.division || null,
          department: employee.employeeDepartment || null,
          team: employee.team || null,
        },
      }));

      res.json({
        message: 'Employees retrieved successfully',
        employees: employeesWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(employees.count / limit),
          totalItems: employees.count,
          itemsPerPage: parseInt(limit),
        },
        division: {
          id: division.id,
          name: division.name,
          sector: division.sector,
        },
      });
    } catch (error) {
      console.error('Error fetching employees by division:', error);
      res.status(500).json({
        message: 'Error fetching employees',
        error: error.message,
      });
    }
  },

  /**
   * Get all employees in a specific department
   * @route GET /api/admin/employees/department/:departmentId
   */
  getEmployeesByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { lang = 'en', page = 1, limit = 50 } = req.query;
      const admin = req.user;

      if (!validateLanguage(lang)) {
        return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
      }

      // Verify department exists and get hierarchy info
      const department = await Department.findByPk(departmentId, {
        include: [
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            include: [
              {
                model: Sector,
                as: 'sector',
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      });

      if (!department) {
        return res.status(404).json({ message: 'Department not found' });
      }

      const offset = (page - 1) * limit;
      let where = { department_id: departmentId };

      // Apply role-based filtering
      if (admin.role === 'Admin') {
        where[`department_${lang}`] = admin.department;
      } else if (admin.role === 'SubCityAdmin') {
        where.city = admin.city;
        where.subcity = admin.subcity;
      } else if (admin.role === 'CityAdmin') {
        where.city = admin.city;
      }

      const employees = await Employee.findAndCountAll({
        where,
        attributes: [
          'id',
          [`first_name_${lang}`, 'first_name'],
          [`middle_name_${lang}`, 'middle_name'],
          [`last_name_${lang}`, 'last_name'],
          'office_number',
          'floor_number',
          [`position_${lang}`, 'position'],
          [`department_${lang}`, 'department'],
          'section',
          'city',
          'subcity',
          'profile_picture',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
          'created_at',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Add profile picture URLs and hierarchy information
      const employeesWithDetails = employees.rows.map((employee) => ({
        ...employee.toJSON(),
        profile_picture: employee.profile_picture
          ? `/Uploads/profile_pictures/${employee.profile_picture}`
          : null,
        hierarchy: {
          sector: employee.sector || null,
          division: employee.division || null,
          department: employee.employeeDepartment || null,
          team: employee.team || null,
        },
      }));

      res.json({
        message: 'Employees retrieved successfully',
        employees: employeesWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(employees.count / limit),
          totalItems: employees.count,
          itemsPerPage: parseInt(limit),
        },
        department: {
          id: department.id,
          name: department.name,
          division: department.division,
        },
      });
    } catch (error) {
      console.error('Error fetching employees by department:', error);
      res.status(500).json({
        message: 'Error fetching employees',
        error: error.message,
      });
    }
  },

  /**
   * Get all employees in a specific team
   * @route GET /api/admin/employees/team/:teamId
   */
  getEmployeesByTeam: async (req, res) => {
    try {
      const { teamId } = req.params;
      const { lang = 'en', page = 1, limit = 50 } = req.query;
      const admin = req.user;

      if (!validateLanguage(lang)) {
        return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
      }

      // Verify team exists and get complete hierarchy info
      const team = await Team.findByPk(teamId, {
        include: [
          {
            model: Department,
            as: 'department',
            attributes: ['id', 'name'],
            include: [
              {
                model: Division,
                as: 'division',
                attributes: ['id', 'name'],
                include: [
                  {
                    model: Sector,
                    as: 'sector',
                    attributes: ['id', 'name'],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      const offset = (page - 1) * limit;
      let where = { team_id: teamId };

      // Apply role-based filtering
      if (admin.role === 'Admin') {
        where[`department_${lang}`] = admin.department;
      } else if (admin.role === 'SubCityAdmin') {
        where.city = admin.city;
        where.subcity = admin.subcity;
      } else if (admin.role === 'CityAdmin') {
        where.city = admin.city;
      }

      const employees = await Employee.findAndCountAll({
        where,
        attributes: [
          'id',
          [`first_name_${lang}`, 'first_name'],
          [`middle_name_${lang}`, 'middle_name'],
          [`last_name_${lang}`, 'last_name'],
          'office_number',
          'floor_number',
          [`position_${lang}`, 'position'],
          [`department_${lang}`, 'department'],
          'section',
          'city',
          'subcity',
          'profile_picture',
          'sector_id',
          'division_id',
          'department_id',
          'team_id',
          'created_at',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
            required: false,
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
            required: false,
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
      });

      // Add profile picture URLs and hierarchy information
      const employeesWithDetails = employees.rows.map((employee) => ({
        ...employee.toJSON(),
        profile_picture: employee.profile_picture
          ? `/Uploads/profile_pictures/${employee.profile_picture}`
          : null,
        hierarchy: {
          sector: employee.sector || null,
          division: employee.division || null,
          department: employee.employeeDepartment || null,
          team: employee.team || null,
        },
      }));

      res.json({
        message: 'Employees retrieved successfully',
        employees: employeesWithDetails,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(employees.count / limit),
          totalItems: employees.count,
          itemsPerPage: parseInt(limit),
        },
        team: {
          id: team.id,
          name: team.name,
          department: team.department,
        },
      });
    } catch (error) {
      console.error('Error fetching employees by team:', error);
      res.status(500).json({
        message: 'Error fetching employees',
        error: error.message,
      });
    }
  },
};

module.exports = employeeHierarchyController;
