const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const {
  PublicComplaint,
  PublicRating,
  PublicFeedback,
  Department,
  Office,
  Employee,
  Admin,
  Division,
  Team,
  Sector,
} = require('../models');

const ActivityLogService = require('../services/adminLogsService');
const publicAdminController = {
  // =================================
  // PUBLIC COMPLAINTS MANAGEMENT
  // =================================

  // Get all public complaints with filters
  getPublicComplaints: async (req, res) => {
    try {
      const {
        status,
        priority,
        department,
        date_from,
        date_to,
        search,
        page = 1,
        limit = 20,
      } = req.query;

      let whereCondition = {};

      if (status) whereCondition.status = status;
      if (priority) whereCondition.priority = priority;
      if (department) whereCondition.department = department;

      if (date_from || date_to) {
        whereCondition.created_at = {};
        if (date_from) whereCondition.created_at[Op.gte] = new Date(date_from);
        if (date_to) whereCondition.created_at[Op.lte] = new Date(date_to);
      }

      if (search) {
        whereCondition[Op.or] = [
          { complainant_name: { [Op.like]: `%${search}%` } },
          { tracking_code: { [Op.like]: `%${search}%` } },
          { phone_number: { [Op.like]: `%${search}%` } },
          { complaint_description: { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const complaints = await PublicComplaint.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Admin,
            as: 'resolver',
            attributes: ['id', 'username'],
          },
          {
            model: Sector,
            as: 'sector',
          },
          {
            model: Department,
            as: 'department',
          },
          {
            model: Division,
            as: 'division',
          },
          {
            model: Employee,
            as: 'employee',
          },
          {
            model: Team,
            as: 'team',
          },
          {
            model: Office,
            as: 'office',
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: {
          complaints: complaints.rows,
          pagination: {
            total: complaints.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(complaints.count / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching public complaints:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaints',
      });
    }
  },

  // Get single public complaint details
  getPublicComplaint: async (req, res) => {
    try {
      const { id } = req.params;

      const complaint = await PublicComplaint.findByPk(id, {
        include: [
          {
            model: Admin,
            as: 'resolver',
            attributes: ['id', 'username'],
          },
        ],
      });

      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: 'Complaint not found',
        });
      }

      res.json({
        success: true,
        data: complaint,
      });
    } catch (error) {
      console.error('Error fetching complaint:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch complaint',
      });
    }
  },

  // Update complaint status and priority
  updateComplaintStatus: [
    body('status')
      .isIn(['pending', 'in_progress', 'resolved', 'closed'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('internal_notes').optional().trim(),
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

        const { id } = req.params;
        const { status, priority, internal_notes } = req.body;
        const adminId = req.admin.id;

        const complaint = await PublicComplaint.findByPk(id);
        if (!complaint) {
          return res.status(404).json({
            success: false,
            message: 'Complaint not found',
          });
        }

        const updateData = { status };
        if (priority) updateData.priority = priority;
        if (internal_notes) updateData.internal_notes = internal_notes;

        if (status === 'resolved' || status === 'closed') {
          updateData.resolved_by = adminId;
          updateData.resolved_at = new Date();
        }

        await complaint.update(updateData);

        res.json({
          success: true,
          message: 'Complaint updated successfully',
          data: complaint,
        });
      } catch (error) {
        console.error('Error updating complaint:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update complaint',
        });
      }
    },
  ],

  // Add response to complaint
  addComplaintResponse: [
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

        const { id } = req.params;
        const { response } = req.body;
        const adminId = req.admin.id;

        const complaint = await PublicComplaint.findByPk(id);
        console.log(response);
        if (!complaint) {
          return res.status(404).json({
            success: false,
            message: 'Complaint not found',
          });
        }

        await complaint.update({
          response,
          responded_by: adminId,
          resolved_at: new Date(),
          status: 'resolved',
        });
        await ActivityLogService.logUpdate(
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

        res.json({
          success: true,
          message: 'Response added successfully',
          data: complaint,
        });
      } catch (error) {
        console.error('Error adding response:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to add response',
        });
      }
    },
  ],

  // =================================
  // PUBLIC RATINGS MANAGEMENT
  // =================================

  // Get all public ratings with analytics
  getPublicRatings: async (req, res) => {
    try {
      const {
        department,
        employee_id,
        rating_from,
        rating_to,
        date_from,
        date_to,
        page = 1,
        limit = 20,
      } = req.query;

      let whereCondition = {};

      if (department) whereCondition.department = department;
      if (employee_id) whereCondition.employee_id = employee_id;

      if (rating_from || rating_to) {
        whereCondition.overall_rating = {};
        if (rating_from) whereCondition.overall_rating[Op.gte] = rating_from;
        if (rating_to) whereCondition.overall_rating[Op.lte] = rating_to;
      }

      if (date_from || date_to) {
        whereCondition.created_at = {};
        if (date_from) whereCondition.created_at[Op.gte] = new Date(date_from);
        if (date_to) whereCondition.created_at[Op.lte] = new Date(date_to);
      }

      const offset = (page - 1) * limit;

      const ratings = await PublicRating.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Employee,
            as: 'employee',
            attributes: ['id', 'first_name_en', 'last_name_en', 'position_en', 'department_id'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Calculate average ratings
      const allRatings = await PublicRating.findAll({
        where: whereCondition,
        attributes: ['overall_rating', 'courtesy_rating', 'timeliness_rating', 'knowledge_rating'],
      });

      let averages = null;
      if (allRatings.length > 0) {
        const totals = allRatings.reduce(
          (acc, rating) => {
            acc.overall += rating.overall_rating;
            acc.courtesy += rating.courtesy_rating;
            acc.timeliness += rating.timeliness_rating;
            acc.knowledge += rating.knowledge_rating;
            return acc;
          },
          { overall: 0, courtesy: 0, timeliness: 0, knowledge: 0 }
        );

        averages = {
          overall: (totals.overall / allRatings.length).toFixed(1),
          courtesy: (totals.courtesy / allRatings.length).toFixed(1),
          timeliness: (totals.timeliness / allRatings.length).toFixed(1),
          knowledge: (totals.knowledge / allRatings.length).toFixed(1),
        };
      }

      res.json({
        success: true,
        data: {
          ratings: ratings.rows,
          averages,
          pagination: {
            total: ratings.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(ratings.count / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching ratings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ratings',
      });
    }
  },

  // Get ratings analytics by department
  getRatingsAnalytics: async (req, res) => {
    try {
      const { department, timeframe = '30' } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(timeframe));

      let whereCondition = {
        created_at: { [Op.gte]: dateFrom },
      };

      if (department) whereCondition.department = department;

      const ratings = await PublicRating.findAll({
        where: whereCondition,
        attributes: [
          'department',
          'overall_rating',
          'courtesy_rating',
          'timeliness_rating',
          'knowledge_rating',
          'created_at',
        ],
        order: [['created_at', 'DESC']],
      });

      // Group by department
      const departmentStats = {};

      ratings.forEach((rating) => {
        const dept = rating.department;
        if (!departmentStats[dept]) {
          departmentStats[dept] = {
            total_ratings: 0,
            totals: { overall: 0, courtesy: 0, timeliness: 0, knowledge: 0 },
          };
        }

        departmentStats[dept].total_ratings++;
        departmentStats[dept].totals.overall += rating.overall_rating;
        departmentStats[dept].totals.courtesy += rating.courtesy_rating;
        departmentStats[dept].totals.timeliness += rating.timeliness_rating;
        departmentStats[dept].totals.knowledge += rating.knowledge_rating;
      });

      // Calculate averages
      Object.keys(departmentStats).forEach((dept) => {
        const stats = departmentStats[dept];
        const count = stats.total_ratings;
        stats.averages = {
          overall: (stats.totals.overall / count).toFixed(1),
          courtesy: (stats.totals.courtesy / count).toFixed(1),
          timeliness: (stats.totals.timeliness / count).toFixed(1),
          knowledge: (stats.totals.knowledge / count).toFixed(1),
        };
        delete stats.totals; // Remove raw totals
      });

      res.json({
        success: true,
        data: {
          timeframe: `${timeframe} days`,
          department_stats: departmentStats,
          total_ratings: ratings.length,
        },
      });
    } catch (error) {
      console.error('Error fetching ratings analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch ratings analytics',
      });
    }
  },

  // =================================
  // PUBLIC FEEDBACK MANAGEMENT
  // =================================

  // Get all public feedback
  getPublicFeedback: async (req, res) => {
    try {
      const { status, feedback_type, date_from, date_to, search, page = 1, limit = 20 } = req.query;

      let whereCondition = {};

      if (status) whereCondition.status = status;
      if (feedback_type) whereCondition.feedback_type = feedback_type;

      if (date_from || date_to) {
        whereCondition.created_at = {};
        if (date_from) whereCondition.created_at[Op.gte] = new Date(date_from);
        if (date_to) whereCondition.created_at[Op.lte] = new Date(date_to);
      }

      if (search) {
        whereCondition[Op.or] = [
          { full_name: { [Op.like]: `%${search}%` } },
          { reference_number: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { message: { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const feedback = await PublicFeedback.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Admin,
            as: 'responder',
            attributes: ['id', 'username'],
          },
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      res.json({
        success: true,
        data: {
          feedback: feedback.rows,
          pagination: {
            total: feedback.count,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(feedback.count / limit),
          },
        },
      });
    } catch (error) {
      console.error('Error fetching feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch feedback',
      });
    }
  },

  // Respond to feedback
  respondToFeedback: [
    body('admin_response')
      .trim()
      .isLength({ min: 10 })
      .withMessage('Response must be at least 10 characters'),
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

        const { id } = req.params;
        const { admin_response } = req.body;
        const adminId = req.admin.id;

        const feedback = await PublicFeedback.findByPk(id);
        if (!feedback) {
          return res.status(404).json({
            success: false,
            message: 'Feedback not found',
          });
        }

        await feedback.update({
          admin_response,
          responded_by: adminId,
          responded_at: new Date(),
          status: 'responded',
        });

        await ActivityLogService.logUpdate(
          'feedback',
          feedback.id,
          req.user?.id,
          feedback.sector_id,
          feedback.subcity_id
        );

        res.json({
          success: true,
          message: 'Response added successfully',
          data: feedback,
        });
      } catch (error) {
        console.error('Error responding to feedback:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to respond to feedback',
        });
      }
    },
  ],

  // Update feedback status
  updateFeedbackStatus: [
    body('status')
      .isIn(['pending', 'reviewed', 'responded', 'closed'])
      .withMessage('Invalid status'),
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

        const { id } = req.params;
        const { status } = req.body;

        const feedback = await PublicFeedback.findByPk(id);
        if (!feedback) {
          return res.status(404).json({
            success: false,
            message: 'Feedback not found',
          });
        }

        await feedback.update({ status });

        res.json({
          success: true,
          message: 'Feedback status updated successfully',
          data: feedback,
        });
      } catch (error) {
        console.error('Error updating feedback status:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to update feedback status',
        });
      }
    },
  ],

  // =================================
  // DEPARTMENT & OFFICE MANAGEMENT
  // =================================

  // Create new department
  createDepartment: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Department name must be between 2-100 characters'),
    body('name_amharic').optional().trim(),
    body('description').optional().trim(),
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

        const department = await Department.create(req.body);

        res.status(201).json({
          success: true,
          message: 'Department created successfully',
          data: department,
        });
      } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create department',
        });
      }
    },
  ],

  // Create new office
  createOffice: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Office name must be between 2-100 characters'),
    body('department_id').isInt().withMessage('Valid department ID is required'),
    body('office_number').optional().trim(),
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

        const office = await Office.create(req.body);

        res.status(201).json({
          success: true,
          message: 'Office created successfully',
          data: office,
        });
      } catch (error) {
        console.error('Error creating office:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to create office',
        });
      }
    },
  ],

  // =================================
  // DASHBOARD STATISTICS
  // =================================

  // Get comprehensive dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      const { timeframe = '30' } = req.query;

      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - parseInt(timeframe));

      // Get all statistics
      const [
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        totalRatings,
        totalFeedback,
        pendingFeedback,
      ] = await Promise.all([
        PublicComplaint.count({
          where: { created_at: { [Op.gte]: dateFrom } },
        }),
        PublicComplaint.count({
          where: {
            status: 'pending',
            created_at: { [Op.gte]: dateFrom },
          },
        }),
        PublicComplaint.count({
          where: {
            status: 'resolved',
            created_at: { [Op.gte]: dateFrom },
          },
        }),
        PublicRating.count({
          where: { created_at: { [Op.gte]: dateFrom } },
        }),
        PublicFeedback.count({
          where: { created_at: { [Op.gte]: dateFrom } },
        }),
        PublicFeedback.count({
          where: {
            status: 'pending',
            created_at: { [Op.gte]: dateFrom },
          },
        }),
      ]);

      // Calculate rates
      const resolutionRate =
        totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0;

      // Get average rating
      const ratings = await PublicRating.findAll({
        where: { created_at: { [Op.gte]: dateFrom } },
        attributes: ['overall_rating'],
      });

      const averageRating =
        ratings.length > 0
          ? (ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length).toFixed(1)
          : 0;

      res.json({
        success: true,
        data: {
          timeframe: `${timeframe} days`,
          complaints: {
            total: totalComplaints,
            pending: pendingComplaints,
            resolved: resolvedComplaints,
            resolution_rate: `${resolutionRate}%`,
          },
          ratings: {
            total: totalRatings,
            average_score: averageRating,
          },
          feedback: {
            total: totalFeedback,
            pending: pendingFeedback,
          },
          last_updated: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
      });
    }
  },
};

module.exports = publicAdminController;
