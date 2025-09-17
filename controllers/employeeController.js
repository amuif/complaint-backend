const { Employee, Admin } = require('../models');
const { validateLanguage, addProfilePictureUrl } = require('../utils/helpers');
const { buildLocationFilter } = require('../middleware/auth');

const ActivityLogService = require('../services/adminLogsService');
// Get all employees (public endpoint)
const getEmployees = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    const employees = await Employee.findAll({
      include: [
        {
          model: require('../models').Sector,
          as: 'sector',
          required: false,
        },
        {
          model: require('../models').Division,
          as: 'division',
          required: false,
        },
        {
          model: require('../models').Department,
          as: 'department',
          required: false,
        },
        {
          model: require('../models').Team,
          as: 'team',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const employeesWithUrls = employees.map(addProfilePictureUrl);

    res.json(employeesWithUrls);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Get employees for admin (with role-based filtering)
const getEmployeesAdmin = async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    const admin = req.user;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    let where = {};

    const currentAdmin = await Admin.findByPk(admin.id);
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    const employees = await Employee.findAll({
      where,
      include: [
        {
          model: require('../models').Sector,
          as: 'sector',
          required: false,
        },
        {
          model: require('../models').Division,
          as: 'division',
          required: false,
        },
        {
          model: require('../models').Department,
          as: 'department',
          required: false,
        },
        {
          model: require('../models').Team,
          as: 'team',
          required: false,
        },
        {
          model: require('../models').Subcity,
          as: 'subcity',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const employeesWithUrls = employees.map(addProfilePictureUrl);

    // Add hierarchy information to response
    const employeesWithHierarchy = employeesWithUrls.map((employee) => ({
      ...employee,
      hierarchy: {
        sector: employee.sector || null,
        division: employee.division || null,
        department: employee.employeeDepartment || null,
        team: employee.team || null,
      },
    }));

    res.json(employeesWithHierarchy);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// Create employee
const createEmployee = async (req, res) => {
  console.log(req.body);
  console.log('Uploaded file:', req.files?.profile_picture?.[0]);

  try {
    const {
      first_name_en,
      first_name_am,
      first_name_af,

      middle_name_en,
      middle_name_am,
      middle_name_af,

      last_name_en,
      last_name_am,
      last_name_af,

      position_en,
      position_am,
      position_af,

      office_number,
      floor_number,
      lang = 'en',
      // Organizational hierarchy fields
      sector_id,
      works_in_head_office,
      division_id,
      department_id,
      subcity_id,
      team_id,
    } = req.body;
    const admin = req.user;
    console.log(req.body);

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    // Extract the actual field values - prioritize multilingual fields if available
    const actualFirstName = first_name_en;
    const actualLastName = middle_name_en;
    const actualPosition = position_en;

    if (!actualFirstName || !actualLastName || !sector_id || !division_id || !department_id) {
      return res.status(400).json({
        message: 'First name, last name, sector,director and team are required',
      });
    }

    // Role-based access control for creating employees
    const employeeData = {
      first_name_en: first_name_en || actualFirstName,
      first_name_am: first_name_am || actualFirstName,
      first_name_af: first_name_af || actualFirstName,

      middle_name_en: middle_name_en || '',
      middle_name_am: middle_name_am || '',
      middle_name_af: middle_name_af || '',

      last_name_en: last_name_en || actualLastName,
      last_name_am: last_name_am || actualLastName,
      last_name_af: last_name_af || actualLastName,

      office_number,
      floor_number,
      position_en: position_en || actualPosition || '',
      position_am: position_am || actualPosition || '',
      position_af: position_af || actualPosition || '',
      subcity_id: subcity_id ? parseInt(subcity_id) : null,

      // Organizational hierarchy fields
      works_in_head_office: works_in_head_office,
      sector_id: sector_id ? parseInt(sector_id) : null,
      division_id: division_id ? parseInt(division_id) : null,
      department_id: department_id ? parseInt(department_id) : null,
      team_id: team_id ? parseInt(team_id) : null,
    };

    if (req.files && req.files.profile_picture && req.files.profile_picture[0]) {
      employeeData.profile_picture = req.files.profile_picture[0].filename;
    }

    const newEmployee = await Employee.create(employeeData);

    await ActivityLogService.logCreate(
      'employee',
      newEmployee.id,
      req.user?.id,
      newEmployee.sector_id,
      newEmployee.subcity_id
    );
    res.status(201).json({
      message: 'Employee created successfully',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Error creating employee', error: error.message });
  }
};

// Update employee
const updateEmployee = async (req, res) => {
  try {
    const {
      id,
      first_name,
      first_name_en,
      first_name_am,
      first_name_af,
      middle_name,
      middle_name_en,
      middle_name_am,
      middle_name_af,
      last_name,
      last_name_en,
      last_name_am,
      last_name_af,
      office_number,
      floor_number,
      position,
      position_en,
      position_am,
      position_af,
      department,
      department_en,
      department_am,
      department_af,
      section,
      city,
      subcity,
      lang = 'en',
      // Organizational hierarchy fields
      sector_id,
      division_id,
      department_id,
      team_id,
      works_in_head_office,
    } = req.body;
    const admin = req.user;

    if (!validateLanguage(lang)) {
      return res.status(400).json({ message: 'Invalid language. Use en, am, or af.' });
    }

    // Check if admin has permission to edit this employee
    const employee = await Employee.findOne({ where: { id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (admin.role === 'SubCityAdmin') {
      if (employee.city !== admin.city || employee.subcity !== admin.subcity) {
        return res.status(403).json({ message: 'Cannot edit employee from another subcity' });
      }
    } else if (admin.role === 'CityAdmin') {
      if (employee.city !== admin.city) {
        return res.status(403).json({ message: 'Cannot edit employee from another city' });
      }
    }

    const updateData = {
      first_name,
      first_name_en,
      first_name_am,
      first_name_af,
      middle_name,
      middle_name_en,
      middle_name_am,
      middle_name_af,
      last_name,
      last_name_en,
      last_name_am,
      last_name_af,
      office_number,
      floor_number,
      position,
      position_en,
      position_am,
      position_af,
      department,
      department_en,
      department_am,
      department_af,

      // [`first_name_${lang}`]: first_name,
      // [`middle_name_${lang}`]: middle_name,
      // [`last_name_${lang}`]: last_name,
      office_number: office_number,
      floor_number: floor_number,
      [`position_${lang}`]: position,
      [`department_${lang}`]: department,
      section: section || subcity,
      city,
      subcity,
      works_in_head_office,
      // Organizational hierarchy fields
      sector_id: sector_id ? parseInt(sector_id) : null,
      division_id: division_id ? parseInt(division_id) : null,
      department_id: department_id ? parseInt(department_id) : null,
      team_id: team_id ? parseInt(team_id) : null,
    };

    if (req.files && req.files.profile_picture && req.files.profile_picture[0]) {
      updateData.profile_picture = req.files.profile_picture[0].filename;
    }

    const newEmployee = await Employee.update(updateData, { where: { id } });

    await ActivityLogService.logUpdate(
      'employee',
      newEmployee.id,
      req.user?.id,
      newEmployee.sector_id,
      newEmployee.subcity_id
    );

    const updatedEmployee = await Employee.findByPk(id, {
      include: [
        {
          model: require('../models').Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
          required: false,
        },
        {
          model: require('../models').Division,
          as: 'division',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
          required: false,
        },
        {
          model: require('../models').Department,
          as: 'department',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
          required: false,
        },
        {
          model: require('../models').Team,
          as: 'team',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
          required: false,
        },
      ],
    });

    res.json({
      message: 'Employee updated successfully',
      employee: {
        id: updatedEmployee.id,
        first_name: updatedEmployee[`first_name_${lang}`],
        middle_name: updatedEmployee[`middle_name_${lang}`],
        last_name: updatedEmployee[`last_name_${lang}`],
        office_number: updatedEmployee.office_number,
        floor_number: updatedEmployee.floor_number,
        position: updatedEmployee[`position_${lang}`],
        department: updatedEmployee[`department_${lang}`],
        section: updatedEmployee.section,
        city: updatedEmployee.city,
        subcity: updatedEmployee.subcity,
        profile_picture: updatedEmployee.profile_picture
          ? `/Uploads/profile_pictures/${updatedEmployee.profile_picture}`
          : null,
        // Organizational hierarchy information
        sector_id: updatedEmployee.sector_id,
        division_id: updatedEmployee.division_id,
        department_id: updatedEmployee.department_id,
        team_id: updatedEmployee.team_id,
      },
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ message: 'Error updating employee', error: error.message });
  }
};

// Delete employee
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.user;

    // Check if admin has permission to delete this employee
    console.log(id);
    const employee = await Employee.findOne({ where: { id } });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (admin.role === 'SubCityAdmin') {
      if (employee.city !== admin.city || employee.subcity !== admin.subcity) {
        return res.status(403).json({ message: 'Cannot delete employee from another subcity' });
      }
    } else if (admin.role === 'CityAdmin') {
      if (employee.city !== admin.city) {
        return res.status(403).json({ message: 'Cannot delete employee from another city' });
      }
    }

    await Employee.destroy({ where: { id } });
    await ActivityLogService.logDelete('employee', employee.id, req.user?.id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Error deleting employee', error: error.message });
  }
};

module.exports = {
  getEmployees,
  getEmployeesAdmin,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
