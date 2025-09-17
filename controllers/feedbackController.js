const {
  Feedback,
  Employee,
  Sector,
  Division,
  Department,
  Team,
  PublicFeedback,
  Admin,
} = require('../models');
const { validateLanguage, getSentiment, addProfilePictureUrl } = require('../utils/helpers');
const { Op } = require('sequelize');
const Subcity = require('../models/Subcity');
const ActivityLogService = require('../services/adminLogsService');
// Create feedback
const createFeedback = async (req, res) => {
  try {
    const {
      full_name,
      phone_number,
      subcity,
      sector_id,
      division_id,
      department_id,
      team_id,
      employee_id,
      comment,
      rating,
      lang,
      description,
    } = req.body;
    //
    // if (!validateLanguage(lang)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid language. Use en, am, or af." });
    // }
    if (!phone_number || !section || !comment) {
      return res.status(400).json({ message: 'Phone number, section, and comment are required' });
    }
    if (rating && ![1, 2, 3, 4, 5].includes(Number(rating))) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const feedbackData = {
      full_name,
      phone_number,
      subcity,
      sector_id,
      division_id,
      department_id,
      team_id,
      employee_id: employee_id,
      description,
      [`comment_${lang}`]: comment,
    };

    const feedback = await Feedback.create(feedbackData);
    await ActivityLogService.logCreate(
      'feedback',
      feedback.id,
      req.user?.id,
      feedback.sector_id,
      feedback.subcity_id
    );

    let employeeDetails = null;
    if (employee_id) {
      const employee = await Employee.findByPk(employee_id, {
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
          'profile_picture',
        ],
      });
      employeeDetails = employee ? addProfilePictureUrl(employee) : null;
    }

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback.id,
        full_name: feedback.full_name,
        phone_number: feedback.phone_number,
        section: feedback.section,
        department_id: feedback.department,
        employee_id: feedback.employee_id,
        comment: feedback[`comment_${lang}`],
        rating: feedback.rating,
        sentiment: getSentiment(feedback.rating),
        created_at: feedback.created_at,
        employee: employeeDetails,
      },
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ message: 'Error submitting feedback', error: error.message });
  }
};

// Get feedback for admin
const getFeedbackAdmin = async (req, res) => {
  try {
    const { lang = 'en', date_from, date_to, department_id } = req.query;
    const admin = req.user;

    // if (!validateLanguage(lang)) {
    //   return res
    //     .status(400)
    //     .json({ message: "Invalid language. Use en, am, or af." });
    // }
    //
    const where = {};
    const currentAdmin = await Admin.findByPk(admin.id);
    if (['Admin', 'Editor', 'Visitor'].includes(admin.role)) {
      if (currentAdmin.sector_id && currentAdmin.subcity_id) {
        where.sector_id = currentAdmin.sector_id;
      } else if (currentAdmin.subcity_id) {
        where.subcity_id = currentAdmin.subcity_id;
      }
    }

    if (date_from && date_to) {
      where.created_at = {
        [Op.between]: [new Date(date_from), new Date(date_to)],
      };
    }

    const feedback = await PublicFeedback.findAll({
      where,
      include: [
        {
          model: Sector,
          as: 'sector',
          attributes: ['id', 'name_en', 'name_am', 'name_af'],
        },
        {
          model: Division,
          as: 'division',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'sector_id'],
        },
        {
          model: Department,
          as: 'department',
          attributes: ['id', 'name_en', 'name_am', 'name_af', 'division_id'],
        },
        {
          model: Team,
          as: 'team',
        },
        {
          model: Employee,
          as: 'employee',
        },

        {
          model: Subcity,
          as: 'sub_city',
        },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(feedback);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ message: 'Error fetching feedback', error: error.message });
  }
};
module.exports = {
  createFeedback,
  getFeedbackAdmin,
};
