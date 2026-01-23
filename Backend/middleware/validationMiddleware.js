const { body, validationResult } = require('express-validator');

const validateUser = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').custom((value) => {
    const cleaned = value.replace(/\D/g, '');
    const indianPattern = /^[6-9]\d{9}$/;
    const intlPattern = /^\d{10,15}$/;
    if (indianPattern.test(cleaned) || intlPattern.test(cleaned)) {
      return true;
    }
    throw new Error('Invalid phone number format');
  }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.removed.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.removed.log('❌ Login validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

// UPDATED: Template validation - supports both old and new format
// validationMiddleware.js - UPDATE this section:

const validateTemplate = [
  body('name')
    .notEmpty()
    .withMessage('Template name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Template name must be between 2 and 100 characters'),
  
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Price cannot be negative');
      }
      return true;
    }),
  
  // ✅ FIXED: Make templateLink optional since UI removed it
// body('templateLink')
//   .optional({ checkFalsy: true }) // ✅ BETTER: Treats empty strings and "undefined" as optional
//   .custom((value) => {
//     // Skip validation if value is undefined, null, empty string, or string "undefined"
//     if (!value || value === 'undefined' || value.trim() === '') {
//       return true;
//     }
    
//     const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w.-]*)*\/?$/;
//     if (!urlPattern.test(value) && !value.startsWith('http')) {
//       throw new Error('Please provide a valid template link');
//     }
//     return true;
//   }),


  body('liveDemo')
    .notEmpty()
    .withMessage('Live demo URL is required')
    .custom((value) => {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w.-]*)*\/?$/;
      if (!urlPattern.test(value) && !value.startsWith('http')) {
        throw new Error('Please provide a valid live demo URL');
      }
      return true;
    }),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 1000 characters'),

  // Optional nested object validation
  body('whatsIncluded').optional(),
  body('templateInfo').optional(), 
  body('developmentProcess').optional(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // console.removed.log('❌ Template validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Template validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];


const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

const validateOrder = [
  body('templateId').isMongoId().withMessage('Valid template ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

const validateMeeting = [
  body('title').notEmpty().withMessage('Meeting title is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required'),
  body('preferredTime').notEmpty().withMessage('Preferred time is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  },
];

module.exports = {
  validateUser,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateTemplate,
  validateOrder,
  validateMeeting
};
