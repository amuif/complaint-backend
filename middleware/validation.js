const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

// Admin validation rules
const validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase, uppercase, and number'),
  handleValidationErrors,
];

const validateAdminCreation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage('Password must contain lowercase, uppercase, number, and special character'),
  body('role').isIn(['SuperAdmin', 'Admin', 'SubCityAdmin']).withMessage('Invalid role'),
  body('department')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2-100 characters'),
  body('section')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Section must be between 2-100 characters'),
  handleValidationErrors,
];

// Employee validation rules
const validateEmployeeCreation = [
  body('first_name_en')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name (English) must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name (English) can only contain letters and spaces'),
  body('last_name_en')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name (English) must be between 1-50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name (English) can only contain letters and spaces'),
  body('office_number')
    .optional()
    .matches(/^[A-Z]\d{3}$/)
    .withMessage('Office number must be format: A101'),
  body('floor_number')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor number must be between 1-50'),
  body('section')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Section must be between 2-100 characters'),
  handleValidationErrors,
];

// Complaint validation rules
const validateComplaintCreation = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5-200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10-2000 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be: low, medium, high, or urgent'),
  handleValidationErrors,
];

// Rating validation rules
const validateRating = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must not exceed 500 characters'),
  handleValidationErrors,
];

// Feedback validation rules
const validateFeedback = [
  body('employee_id').isInt({ min: 1 }).withMessage('Valid employee ID is required'),
  body('message')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Message must be between 5-1000 characters'),
  handleValidationErrors,
];

// ID parameter validation
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100'),
  handleValidationErrors,
];

module.exports = {
  validateAdminLogin,
  validateAdminCreation,
  validateEmployeeCreation,
  validateComplaintCreation,
  validateRating,
  validateFeedback,
  validateId,
  validatePagination,
  handleValidationErrors,
};
