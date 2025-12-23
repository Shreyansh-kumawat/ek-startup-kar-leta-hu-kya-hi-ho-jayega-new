const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

// Validate email address
exports.validateEmail = (email) => {
  try {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required and must be a string');
    }

    const trimmedEmail = email.trim();

    if (!validator.isEmail(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    return { success: true, value: trimmedEmail };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Validate phone number
exports.validatePhone = (phone, countryCode = 'IN') => {
  try {
    if (!phone || typeof phone !== 'string') {
      throw new Error('Phone number is required and must be a string');
    }

    const trimmedPhone = phone.trim();

    if (!validator.isMobilePhone(trimmedPhone, countryCode, { strictMode: true })) {
      throw new Error(`Invalid phone number format for country code ${countryCode}`);
    }

    return { success: true, value: trimmedPhone };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Sanitize input to prevent XSS and clean data
exports.sanitizeInput = (input) => {
  try {
    if (!input) {
      return { success: true, value: '' };
    }

    const inputType = typeof input;

    if (inputType === 'string') {
      const sanitized = sanitizeHtml(input, {
        allowedTags: [],
        allowedAttributes: {},
      }).trim();
      return { success: true, value: sanitized };
    }

    if (inputType === 'object') {
      const sanitizedObject = {};
      for (const key in input) {
        if (typeof input[key] === 'string') {
          sanitizedObject[key] = sanitizeHtml(input[key], {
            allowedTags: [],
            allowedAttributes: {},
          }).trim();
        } else {
          sanitizedObject[key] = input[key];
        }
      }
      return { success: true, value: sanitizedObject };
    }

    return { success: true, value: input };
  } catch (error) {
    return { success: false, error: 'Failed to sanitize input: ' + error.message };
  }
};
