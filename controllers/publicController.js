const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { Op } = require('sequelize');
const ActivityLogService = require('../services/adminLogsService');
const {
  PublicComplaint,
  ComplaintAttachment,
  PublicRating,
  PublicFeedback,
  Department,
  Office,
  Employee,
  Sector,
  Division,
  Team,
} = require('../models');
const Subcity = require('../models/Subcity');

// Helper function to generate tracking codes
const generateTrackingCode = () => {
  const prefix = 'TC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Configure multer for voice complaints
const voiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'Uploads/voice_complaints/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'voice-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const parseForeignKey = (value) => {
  if (typeof value === 'string') {
    value = value.trim();
  }
  return value ? parseInt(value, 10) || null : null;
};
const voiceUpload = multer({
  storage: voiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.mp3|\.wav|\.m4a|\.ogg|\.webm$/i;
    // const allowedTypes = /mp3|wav|m4a|ogg|webm/;
    // const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const allowedMimeTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/mp4',
      'audio/ogg',
      'audio/webm',
      'audio/webm;codecs=opus',
    ];
    const mimetype = allowedMimeTypes.includes(file.mimetype);
    // const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      const errorMsg = `Invalid file: MIME type (${file.mimetype}) or extension (${path.extname(
        file.originalname
      )}) not allowed. Supported: mp3, wav, m4a, ogg, webm`;
      console.error(errorMsg);
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// Validation rules
const complaintValidation = [
  body('complaint_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('phone_number')
    .matches(/^[\+]?[0-9\-\s]+$/)
    .isLength({ min: 9, max: 15 })
    .withMessage('Invalid phone number format'),
  body('complaint_description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Complaint description must be at least 10 characters'),
];

//voice Validation
const voicecomplaintValidation = [
  body('phone_number')
    .matches(/^[\+]?[0-9\-\s]+$/)
    .isLength({ min: 9, max: 15 })
    .withMessage('Invalid phone number format'),
];

const ratingValidation = [
  body('overall_rating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be 1-5'),
  body('courtesy').isInt({ min: 1, max: 5 }).withMessage('Courtesy rating must be 1-5'),
  body('punctuality').isInt({ min: 1, max: 5 }).withMessage('Punctuality rating must be 1-5'),
  body('knowledge').isInt({ min: 1, max: 5 }).withMessage('Knowledge rating must be 1-5'),
  // body('full_name').optional().trim().isLength({ min: 2 }),
  // body('phone_number').optional().trim().isLength({ min: 9 }),
];

const feedbackValidation = [
  body('full_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2-100 characters'),
  body('phone_number').optional().trim().isLength({ min: 9 }),
  body('feedback_type')
    .isIn(['complaint', 'suggestion', 'compliment'])
    .withMessage('Invalid feedback type'),
  body('feedback_text')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters'),
];

const publicController = {
  // =================================
  // Subcity apis
  // =================================
  // Get all unique subcities
  getSubcities: async (req, res) => {
    try {
      const subcities = await Subcity.findAll({
        order: [['name_en', 'ASC']],
        raw: true,
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`Loaded ${subcities.length} subcities from database`);
      }

      res.json(subcities);
    } catch (error) {
      console.error('Subcity fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch subcities',
      });
    }
  },
  // get sub city appointed person
  getSubcityAdmin: async (req, res) => {
    try {
      const { subcityId } = req.params;
      const subcity = await Subcity.findByPk(subcityId);
      if (!subcity) return res.status(404).json({ message: "Coudn't find appointed person" });
      res.json(subcity);
    } catch (error) {
      console.error('Subcity person fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointed person',
      });
    }
  },
  getDivisionsBySubcityAdmin: async (req, res) => {
    const { subcityId } = req.params;
    try {
      const direcors = await Division.findAll({
        where: { subcity_id: subcityId },
        include: [
          {
            model: Subcity,
            as: 'subcity',
          },
        ],
      });
      res.json(direcors);
    } catch (error) {
      console.error('Fetching Subcity director by admin error:', error);
      res.status(500).json({
        message: 'Failed to fetch director through appointed person',
      });
    }
  },
  getDepartmentsBySubcityDivisions: async (req, res) => {
    const { subcityId, divisionId } = req.params;
    try {
      const departments = await Department.findAll({
        where: { subcity_id: subcityId, division_id: divisionId },
        include: [
          {
            model: Subcity,
            as: 'subcity',
          },
        ],
      });
      res.json(departments);
    } catch (error) {
      console.error('Fetching Subcity deparmtent by admin division:', error);
      res.status(500).json({
        message: 'Failed to fetch depratment through subcity division',
      });
    }
  },

  getEmployeesBySubcity: async (req, res) => {
    const { subcityId } = req.params;
    const whereClause = {};
    if (subcityId) {
      whereClause.subcity_id = subcityId;
    }
    try {
      const employees = await Employee.findAll({
        where: whereClause,
        include: [
          {
            model: Subcity,
            as: 'subcity',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'department',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
      });
      res.json(employees);
    } catch (error) {
      console.error('Fetching Subcity deparmtent by admin division:', error);
      res.status(500).json({
        message: 'Failed to fetch employees through subcity division',
      });
    }
  },
  // =================================
  // DEPARTMENTS & OFFICES
  // =================================

  // Get all active departments
  getDepartments: async (req, res) => {
    try {
      const departments = await Department.findAll({
        attributes: ['id', 'name_en', 'name_am', 'description_en'],
        order: [['name_en', 'ASC']],
      });

      // Transform the data to match frontend expectations
      const transformedDepts = departments.map((dept) => ({
        id: dept.id,
        name: dept.name_en,
        name_amharic: dept.name_am,
        description: dept.description_en,
      }));

      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Loaded ${transformedDepts.length} departments from database`);
      }
      res.json({
        success: true,
        data: transformedDepts,
      });
    } catch (error) {
      console.error('Department fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
      });
    }
  },

  // Get offices by department
  getOfficesByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const offices = await Office.findAll({
        where: {
          department_id: departmentId,
          is_active: true,
        },
        attributes: ['id', 'name', 'name_amharic', 'office_number', 'description'],
        order: [['office_number', 'ASC']],
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(
          `✅ Loaded ${offices.length} offices for department ${departmentId} from database`
        );
      }
      res.json({
        success: true,
        data: offices,
      });
    } catch (error) {
      console.error('Office fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch offices',
      });
    }
  },

  // Get employees by department (for rating) - Updated to use hierarchy
  getEmployeesByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      const employees = await Employee.findAll({
        where: {
          [Op.or]: [
            { department_id: departmentId }, // New hierarchy field
            { department_en: departmentId }, // Legacy field for backward compatibility
          ],
        },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
          {
            model: Division,
            as: 'division',
            attributes: ['id', 'name'],
          },
          {
            model: Department,
            as: 'employeeDepartment',
            attributes: ['id', 'name'],
          },
          {
            model: Team,
            as: 'team',
            attributes: ['id', 'name'],
          },
        ],
        order: [['first_name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: employees,
      });
    } catch (error) {
      console.error('Employees by department fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get employees with full organizational hierarchy
  getEmployeesWithHierarchy: async (req, res) => {
    try {
      const { sector, division, department, team, page = 1, limit = 50 } = req.query;

      const whereCondition = {};

      if (sector) whereCondition.sector_id = sector;
      if (division) whereCondition.division_id = division;
      if (department) whereCondition.department_id = department;
      if (team) whereCondition.employee_id = team;

      const offset = (page - 1) * limit;

      const employees = await Employee.findAndCountAll({
        where: whereCondition,
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'employeeDepartment',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
      });

      res.json({
        success: true,
        data: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit),
        },
      });
    } catch (error) {
      console.error('Employees with hierarchy fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees with hierarchy',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get employees by sector ID
  getEmployeesBySector: async (req, res) => {
    try {
      const { sectorId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate sector exists
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({
          success: false,
          message: 'Sector not found',
        });
      }

      const offset = (page - 1) * limit;

      const employees = await Employee.findAndCountAll({
        where: { sector_id: sectorId },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'employeeDepartment',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
      });

      res.json({
        success: true,
        message: `Employees in sector: ${sector.name_en}`,
        data: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit),
        },
        sector: {
          id: sector.id,
          name_en: sector.name_en,
        },
      });
    } catch (error) {
      console.error('Employees by sector fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees by sector',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get employees by division ID
  getEmployeesByDivision: async (req, res) => {
    try {
      const { divisionId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate division exists and get sector info
      const division = await Division.findByPk(divisionId, {
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
        ],
      });

      if (!division) {
        return res.status(404).json({
          success: false,
          message: 'Division not found',
        });
      }

      const offset = (page - 1) * limit;

      const employees = await Employee.findAndCountAll({
        where: { division_id: divisionId },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'employeeDepartment',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
      });

      res.json({
        success: true,
        message: `Employees in division: ${division.name_en}`,
        data: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit),
        },
        division: {
          id: division.id,
          name_en: division.name_en,
          sector: division.sector,
        },
      });
    } catch (error) {
      console.error('Employees by division fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees by division',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get employees by department ID
  getEmployeesByDepartmentId: async (req, res) => {
    try {
      const { departmentId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate department exists and get hierarchy info
      const department = await Department.findByPk(departmentId, {
        include: [
          {
            model: Division,
            as: 'division',
            include: [
              {
                model: Sector,
                as: 'sector',
              },
            ],
          },
        ],
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found',
        });
      }

      const offset = (page - 1) * limit;

      const employees = await Employee.findAndCountAll({
        where: { department_id: departmentId },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'employeeDepartment',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
      });

      res.json({
        success: true,
        message: `Employees in department: ${department.name_en}`,
        data: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit),
        },
        department: {
          id: department.id,
          name_en: department.name_en,
          division: department.division,
        },
      });
    } catch (error) {
      console.error('Employees by department fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees by department',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  //get employees by subcity
  // Get employees by team ID
  getEmployeesByTeam: async (req, res) => {
    try {
      const { teamId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      // Validate team exists and get full hierarchy info
      const team = await Team.findByPk(teamId, {
        include: [
          {
            model: Department,
            as: 'department',
            include: [
              {
                model: Division,
                as: 'division',
                include: [
                  {
                    model: Sector,
                    as: 'sector',
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!team) {
        return res.status(404).json({
          success: false,
          message: 'Team not found',
        });
      }

      const offset = (page - 1) * limit;

      const employees = await Employee.findAndCountAll({
        where: { employee_id: teamId },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'sector_id',
          'division_id',
          'department_id',
          'employee_id',
        ],
        include: [
          {
            model: Sector,
            as: 'sector',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Department,
            as: 'employeeDepartment',
          },
          {
            model: Team,
            as: 'team',
          },
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: offset,
      });

      res.json({
        success: true,
        message: `Employees in team: ${team.name_en}`,
        data: employees.rows,
        pagination: {
          total: employees.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(employees.count / limit),
        },
        team: {
          id: team.id,
          name_en: team.name_en,
          department: team.department,
        },
      });
    } catch (error) {
      console.error('Employees by team fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch employees by team',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // =================================
  // PUBLIC COMPLAINTS
  // =================================

  // Submit a text complaint
  submitComplaint: [
    ...complaintValidation,
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const {
          complaint_name,
          phone_number,
          sub_city,
          woreda,
          complaint_description,
          complaint_date,
          desired_action,
          // Organizational hierarchy fields
          sector_id,
          division_id,
          department_id,
          employee_id,
          subcity_id,
        } = req.body;
        console.log(req.body);

        let attachmentFile = null;

        if (req.files && req.files.attachment) {
          attachmentFile = req.files.attachment[0];
        } else if (req.file) {
          // If you used upload.single('attachment')
          attachmentFile = req.file;
        }
        const trackingCode = generateTrackingCode();
        const complaintData = {
          complaint_name: complaint_name,
          phone_number: phone_number,
          sub_city: sub_city,
          woreda: woreda,
          complaint_description: complaint_description,
          complaint_date: complaint_date || new Date(),
          complaint_source: 'public_complaint',
          desired_action: desired_action,
          tracking_code: trackingCode,
          status: 'submitted',
          // Organizational hierarchy fields
          sector_id: parseForeignKey(sector_id),
          division_id: parseForeignKey(division_id),
          department_id: parseForeignKey(department_id),
          employee_id: parseForeignKey(employee_id),
          subcity_id: parseForeignKey(subcity_id),
          created_at: complaint_date ? new Date(complaint_date) : new Date(),
        };

        const complaint = await PublicComplaint.create(complaintData);
        if (attachmentFile) {
          await ComplaintAttachment.create({
            complaint_id: complaint.id,
            file_path: attachmentFile.path,
            file_type: attachmentFile.mimetype,
          });
        }

        await ActivityLogService.logCreate(
          'complaint',
          complaint.id,
          req.user?.id,
          {
            phone_number: complaint.phone_number,
            complaint_type: complaint.complaint_type,
            priority: complaint.priority,
          },
          complaint.sector_id,
          complaint.subcity_id
        );

        console.log(`✅ Complaint created with ID: ${complaint.id}, tracking: ${trackingCode}`);
        res.status(201).json({
          success: true,
          message: 'Complaint submitted successfully',
          data: {
            tracking_code: phone_number,
            complaint_id: complaint.id,
            status: 'pending',
          },
        });
      } catch (error) {
        console.error('❌ Error submitting complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit complaint',
        });
      }
    },
  ],

  // Submit a voice complaint
  submitvoicecomplaint: [
    ...voicecomplaintValidation,
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        // Multer with fields returns req.files
        if (!req.files || !req.files.voice_file) {
          return res.status(400).json({
            success: false,
            message: 'Voice file is required',
          });
        }

        const voiceFile = req.files.voice_file[0];
        let attachmentFile = null;

        if (req.files && req.files.attachment) {
          attachmentFile = req.files.attachment[0];
        } else if (req.file) {
          // If you used upload.single('attachment')
          attachmentFile = req.file;
        }

        const {
          complainant_name,
          phone_number,
          woreda,
          complaint_description,
          complaint_source,
          sector_id,
          division_id,
          department_id,
          subcity_id,
          employee_id,
          complaint_date,
          office,
          desired_action,
        } = req.body;

        console.log(req.body);

        const complaint = await PublicComplaint.create({
          complaint_name: complainant_name,
          phone_number,
          woreda,
          complaint_description: 'voice complaint - please listen to audio file',
          complaint_date: complaint_date ? new Date(complaint_date) : new Date(),
          office,
          desired_action,
          tracking_code: phone_number,
          complaint_source,
          voice_note: voiceFile.path,
          attachment: attachmentFile ? attachmentFile.path : null,
          sector_id: parseForeignKey(sector_id),
          division_id: parseForeignKey(division_id),
          department_id: parseForeignKey(department_id),
          employee_id: parseForeignKey(employee_id),
          subcity_id: parseForeignKey(subcity_id),
          status: 'submitted',
          created_at: complaint_date || new Date(),
        });
        if (attachmentFile) {
          await ComplaintAttachment.create({
            complaint_id: complaint.id,
            file_path: attachmentFile.path,
            file_type: attachmentFile.mimetype,
          });
        }
        await ActivityLogService.logCreate(
          'complaint',
          complaint.id,
          req.user?.id,
          {
            phone_number: complaint.phone_number,
            complaint_type: complaint.complaint_type,
            priority: complaint.priority,
          },
          complaint.sector_id,
          complaint.subcity_id
        );

        res.status(201).json({
          success: true,
          message: 'Voice complaint submitted successfully',
          data: {
            tracking_code: phone_number,
            complaint_id: complaint.id,
            status: 'pending',
            voice_file: voiceFile.filename,
            attachment: attachmentFile ? attachmentFile.filename : null,
          },
        });
      } catch (error) {
        console.error('❌ Error submitting complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit voice complaint',
        });
      }
    },
  ],
  // Track complaint by tracking code or phone number
  trackComplaint: async (req, res) => {
    try {
      const { identifier } = req.params;

      const complaints = await PublicComplaint.findAll({
        where: { phone_number: identifier.trim() },
        include: [
          {
            model: Department,
            as: 'department',
          },
          {
            model: Sector,
            as: 'sector',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Team,
            as: 'team',
          },
          {
            model: Employee,
            as: 'employee',
          },
        ],
        order: [['created_at', 'DESC']],
      });

      if (complaints.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No complaints found with this identifier',
        });
      }

      res.json({
        success: true,
        data: complaints,
      });
    } catch (error) {
      console.error('error', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track complaint',
      });
    }
  },

  // =================================
  // PUBLIC RATINGS
  // =================================

  // Submit service rating
  submitRating: [
    ...ratingValidation,
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const {
          subcity_id,
          sector_id,
          division_id,
          department_id,
          team_id,
          employee_id,
          overall_rating,
          courtesy,
          punctuality,
          knowledge,
          additional_comments,
          full_name,
          phone_number,
          waiting_time_rating,
        } = req.body;
        console.log(req.body);

        // Generate tracking code for rating
        const trackingCode = generateTrackingCode();

        const rating = await PublicRating.create({
          full_name: full_name || 'Anonymous',
          phone_number: phone_number || 'Anonymous',
          subcity_id: subcity_id,
          sector_id: sector_id,
          division_id: division_id,
          department_id: department_id,
          employee_id: employee_id || null,
          service_type: 'General Service Rating',
          overall_rating: overall_rating,
          courtesy: courtesy,
          punctuality: punctuality,
          knowledge: knowledge,
          waiting_time_rating: waiting_time_rating || null,
          additional_comments: additional_comments,
          tracking_code: phone_number,
          rating_source: 'public_rating',
        });

        await ActivityLogService.logCreate(
          'rating',
          rating.id,
          req.user?.id,
          rating.sector_id,
          rating.subcity_id
        );

        res.status(201).json({
          success: true,
          message: 'Rating submitted successfully',
          data: {
            rating_id: rating.id,
            tracking_code: trackingCode,
            average_rating: ((overall_rating + courtesy + punctuality + knowledge) / 4).toFixed(1),
          },
        });
      } catch (error) {
        console.error('Rating submission error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit rating',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  ],

  // Get department ratings summary
  getDepartmentRatings: async (req, res) => {
    try {
      const { department } = req.params;

      const ratings = await PublicRating.findAll({
        where: { department },
        attributes: [
          'overall_rating',
          'courtesy_rating',
          'timeliness_rating',
          'knowledge_rating',
          'created_at',
        ],
        order: [['created_at', 'DESC']],
        limit: 100, // Last 100 ratings
      });

      if (ratings.length === 0) {
        return res.json({
          success: true,
          data: {
            department,
            total_ratings: 0,
            averages: {
              overall: 0,
              courtesy: 0,
              timeliness: 0,
              knowledge: 0,
            },
          },
        });
      }

      const totals = ratings.reduce(
        (acc, rating) => {
          acc.overall += rating.overall_rating;
          acc.courtesy += rating.courtesy_rating;
          acc.timeliness += rating.timeliness_rating;
          acc.knowledge += rating.knowledge_rating;
          return acc;
        },
        { overall: 0, courtesy: 0, timeliness: 0, knowledge: 0 }
      );

      const count = ratings.length;

      res.json({
        success: true,
        data: {
          department,
          total_ratings: count,
          averages: {
            overall: (totals.overall / count).toFixed(1),
            courtesy: (totals.courtesy / count).toFixed(1),
            timeliness: (totals.timeliness / count).toFixed(1),
            knowledge: (totals.knowledge / count).toFixed(1),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch department ratings',
      });
    }
  },

  // =================================
  // PUBLIC FEEDBACK
  // =================================

  // Submit general feedback
  submitFeedback: [
    ...feedbackValidation,
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log('errors at creating feedback', errors);
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
          });
        }

        const {
          full_name,
          phone_number,
          service_type,
          feedback_type,
          feedback_text,
          feedback_source,
          department_id,
          sector_id,
          division_id,
          employee_id,
          team_id,
          subcity,
          service_exprienced,
          overall_satisfaction,
          would_recommend,
        } = req.body;
        console.log(req.body);

        const trackingCode = phone_number;

        const feedback = await PublicFeedback.create({
          full_name: full_name || 'Anonymous',
          phone_number: phone_number || 'N/A',
          department: service_type || 'General',
          feedback_type: feedback_type === 'complaint' ? 'concern' : feedback_type,
          subject: `${feedback_type} regarding ${service_type || 'General Services'}`,
          sector_id,
          division_id,
          department_id,
          team_id,
          employee_id,
          feedback_text: feedback_text,
          feedback_source: feedback_source,
          status: 'new',

          subcity,
          service_exprienced,
          overall_satisfaction,
          would_recommend,
          is_anonymous: full_name ? false : true,

          trackingCode,
        });

        await ActivityLogService.logCreate(
          'feedback',
          feedback.id,
          req.user?.id,
          feedback.sector_id,
          feedback.subcity_id
        );
        res.status(201).json({
          success: true,
          message: 'Feedback submitted successfully',
          data: {
            reference_number: trackingCode,
            feedback_id: feedback.id,
            status: 'pending',
          },
        });
      } catch (error) {
        console.error('Feedback submission error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to submit feedback',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
      }
    },
  ],

  // Check feedback status
  checkFeedbackStatus: async (req, res) => {
    try {
      const { referenceNumber } = req.params;
      const feedback = await PublicFeedback.findOne({
        where: { phone_number: referenceNumber },
        attributes: [
          'id',
          'full_name',
          'feedback_type',
          'feedback_text',
          'status',
          'admin_response',
          'created_at',
          'updated_at',
        ],
      });

      if (!feedback) {
        return res.status(404).json({
          success: false,
          message: 'Feedback not found with this reference number',
        });
      }

      res.json({
        success: true,
        data: feedback,
      });
    } catch (error) {
      console.error('Error at checking feedback status', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check feedback status',
      });
    }
  },

  // =================================
  // TEAM/STAFF INFORMATION
  // =================================

  // Get team members (public directory)
  getTeamMembers: async (req, res) => {
    try {
      const { search, department, limit = 20, offset = 0 } = req.query;

      let whereCondition = {};

      if (search) {
        whereCondition[Op.or] = [
          { first_name_en: { [Op.like]: `%${search}%` } },
          { last_name_en: { [Op.like]: `%${search}%` } },
          { position_en: { [Op.like]: `%${search}%` } },
          { office_number: { [Op.like]: `%${search}%` } },
        ];
      }

      if (department) {
        whereCondition.department_en = department;
      }

      const employees = await Employee.findAndCountAll({
        where: whereCondition,
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'department_id',
          'office_number',
          'section',
          'city',
          'subcity',
          'profile_picture',
        ],
        order: [['first_name_en', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: {
          employees: employees.rows,
          total: employees.count,
          page: Math.floor(offset / limit) + 1,
          total_pages: Math.ceil(employees.count / limit),
        },
      });
    } catch (error) {
      console.error('Team members fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team members',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get individual team member details
  getTeamMember: async (req, res) => {
    try {
      const { employeeId } = req.params;

      const employee = await Employee.findOne({
        where: {
          id: employeeId,
        },
        attributes: [
          'id',
          'first_name_en',
          'last_name_en',
          'position_en',
          'department_en',
          'office_number',
          'section',
          'city',
          'subcity',
          'profile_picture',
        ],
      });

      if (!employee) {
        return res.status(404).json({
          success: false,
          message: 'Team member not found',
        });
      }

      // Get average ratings for this employee
      const ratings = await PublicRating.findAll({
        where: { employee_id: employeeId },
        attributes: ['overall_rating', 'courtesy_rating', 'timeliness_rating', 'knowledge_rating'],
      });

      let averageRatings = null;
      if (ratings.length > 0) {
        const totals = ratings.reduce(
          (acc, rating) => {
            acc.overall += rating.overall_rating;
            acc.courtesy += rating.courtesy_rating;
            acc.timeliness += rating.timeliness_rating;
            acc.knowledge += rating.knowledge_rating;
            return acc;
          },
          { overall: 0, courtesy: 0, timeliness: 0, knowledge: 0 }
        );

        averageRatings = {
          overall: (totals.overall / ratings.length).toFixed(1),
          courtesy: (totals.courtesy / ratings.length).toFixed(1),
          timeliness: (totals.timeliness / ratings.length).toFixed(1),
          knowledge: (totals.knowledge / ratings.length).toFixed(1),
          total_ratings: ratings.length,
        };
      }

      res.json({
        success: true,
        data: {
          ...employee.toJSON(),
          ratings: averageRatings,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch team member details',
      });
    }
  },

  // Get all sectors
  getSectors: async (req, res) => {
    try {
      const sectors = await Sector.findAll({
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: sectors,
      });
    } catch (error) {
      console.log('Sectors fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sectors',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get all divisions
  getDivisions: async (req, res) => {
    try {
      const divisions = await Division.findAll({
        include: [
          {
            model: Sector,
            as: 'sector',

            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
        ],
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: divisions,
      });
    } catch (error) {
      console.error('Divisions fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch divisions',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get divisions by sector ID
  getDivisionsBySector: async (req, res) => {
    try {
      const { sectorId } = req.params;

      // Validate sector exists
      const sector = await Sector.findByPk(sectorId);
      if (!sector) {
        return res.status(404).json({
          success: false,
          message: 'Sector not found',
        });
      }

      const divisions = await Division.findAll({
        where: {
          sector_id: sectorId,
        },
        include: [
          {
            model: Sector,
            as: 'sector',

            attributes: ['id', 'name_af', 'name_en', 'name_am'],
          },
        ],
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: divisions,
        sector: {
          id: sector.id,
          name_en: sector.name_en,
        },
      });
    } catch (error) {
      console.error('Divisions by sector fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch divisions for sector',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get all departments
  getDepartments: async (req, res) => {
    try {
      const departments = await Department.findAll({
        include: [
          {
            model: Division,
            as: 'division',
            include: [
              {
                model: Sector,
                as: 'sector',
              },
            ],
          },
        ],
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: departments,
      });
    } catch (error) {
      console.error('Departments fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get departments by division ID
  getDepartmentsByDivision: async (req, res) => {
    try {
      const { divisionId } = req.params;

      // Validate division exists
      const division = await Division.findByPk(divisionId, {
        include: [
          {
            model: Sector,
            as: 'sector',
          },
        ],
      });

      if (!division) {
        return res.status(404).json({
          success: false,
          message: 'Division not found',
        });
      }

      console.log(divisionId);
      const departments = await Department.findAll({
        where: {
          division_id: divisionId,
        },
        include: [
          {
            model: Division,
            as: 'division',
            include: [
              {
                model: Sector,
                as: 'sector',
                attributes: ['id', 'name_af', 'name_en', 'name_am'],
              },
            ],
          },
        ],
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: departments,
        division: {
          id: division.id,
          name_en: division.name_en,
          sector: division.sector,
        },
      });
    } catch (error) {
      console.error('Departments by division fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch departments for division',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get all teams
  getTeams: async (req, res) => {
    try {
      const teams = await Team.findAll({
        include: [
          {
            model: Department,
            as: 'department',
            include: [
              {
                model: Division,
                as: 'division',
                include: [
                  {
                    model: Sector,
                    as: 'sector',
                  },
                ],
              },
            ],
          },
        ],
        order: [['name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: teams,
      });
    } catch (error) {
      console.error('Teams fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teams',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },

  // Get teams by department ID
  getTeamsByDepartment: async (req, res) => {
    try {
      const { departmentId } = req.params;

      // Validate department exists
      const department = await Department.findByPk(departmentId, {
        include: [
          {
            model: Division,
            as: 'division',
            include: [
              {
                model: Sector,
                as: 'sector',
                attributes: ['id', 'name_af', 'name_en', 'name_am'],
              },
            ],
          },
        ],
      });

      if (!department) {
        return res.status(404).json({
          success: false,
          message: 'Department not found',
        });
      }

      const teams = await Employee.findAll({
        where: {
          department_id: departmentId,
        },
        include: [
          {
            model: Department,
            as: 'department',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Sector,
            as: 'sector',
          },
        ],
        order: [['first_name_en', 'ASC']],
      });

      res.json({
        success: true,
        data: teams,
        department: {
          id: department.id,
          name_en: department.name_en,
          division: department.division,
        },
      });
    } catch (error) {
      console.error('Teams by department fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch teams for department',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
};

module.exports = publicController;
