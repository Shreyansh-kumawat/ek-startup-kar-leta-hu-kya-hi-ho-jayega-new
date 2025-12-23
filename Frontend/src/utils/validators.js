// Individual validation functions
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  if (!/(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
    return 'Password must contain both uppercase and lowercase letters';
  }
  return null;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile format
  const internationalRegex = /^\+\d{10,15}$/; // International format
  
  if (!phone) return 'Phone number is required';
  
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  if (phoneRegex.test(cleanPhone)) return null;
  if (internationalRegex.test(cleanPhone)) return null;
  
  return 'Invalid phone number. Enter 10-digit mobile number or international format';
};

export const validateName = (name, fieldName = 'Name') => {
  if (!name || !name.trim()) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
  
  if (!/^[a-zA-Z\s\.\-\']+$/.test(name.trim())) {
    return `${fieldName} can only contain letters, spaces, dots, hyphens, and apostrophes`;
  }
  
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateMinLength = (value, minLength, fieldName = 'Field') => {
  if (value && value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }
  return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
  if (value && value.length > maxLength) {
    return `${fieldName} must be less than ${maxLength} characters`;
  }
  return null;
};

export const validateNumber = (value, fieldName = 'Field') => {
  if (value && isNaN(value)) {
    return `${fieldName} must be a valid number`;
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName = 'Field') => {
  const numberError = validateNumber(value, fieldName);
  if (numberError) return numberError;
  
  if (value && Number(value) <= 0) {
    return `${fieldName} must be greater than 0`;
  }
  return null;
};

// FIXED: For array-based validation (if needed elsewhere)
export const validateField = (value, rules) => {
  // Handle both function and array formats
  if (typeof rules === 'function') {
    return rules(value);
  }
  
  if (Array.isArray(rules)) {
    for (const rule of rules) {
      const error = rule(value);
      if (error) return error;
    }
  }
  
  return null;
};

export const validateForm = (values, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(fieldName => {
    const validator = validationRules[fieldName];
    const error = typeof validator === 'function' 
      ? validator(values[fieldName], values)
      : validateField(values[fieldName], validator);
    
    if (error) {
      errors[fieldName] = error;
    }
  });
  
  return errors;
};

// FIXED: Direct function format for useForm compatibility
export const validationRules = {
  // Basic validations
  email: (value) => validateEmail(value),
  password: (value) => validatePassword(value),
  name: (value) => validateName(value, 'Name'),
  phone: (value) => validatePhone(value),
  required: (value, fieldName = 'Field') => validateRequired(value, fieldName),
  
  // Composite validations
  strongPassword: (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return null;
  },
  
  username: (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 20) return 'Username must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return null;
  },
  
  url: (value) => {
    if (!value) return null; // Optional field
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  }
};

// BONUS: Compose multiple validators  
export const compose = (...validators) => (value, allValues) => {
  for (let validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return null;
};

// BONUS: Array-based rules (for other use cases)
export const arrayBasedRules = {
  email: [validateRequired, validateEmail],
  password: [validateRequired, validatePassword],
  name: [(value) => validateName(value, 'Name')],
  phone: [validateRequired, validatePhone],
  required: [validateRequired]
};

// Common patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[6-9]\d{9}$/,
  indianPhone: /^[6-9]\d{9}$/,
  internationalPhone: /^\+\d{10,15}$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/.+/,
  name: /^[a-zA-Z\s\.\-\']+$/
};

export default validationRules;
