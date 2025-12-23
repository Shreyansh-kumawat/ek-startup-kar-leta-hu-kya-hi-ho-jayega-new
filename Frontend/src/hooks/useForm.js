// If your useForm.js needs fixing too:
import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate field on blur
    if (validationRules[name]) {
      const validator = validationRules[name];
      const error = typeof validator === 'function' 
        ? validator(values[name], values) 
        : null;
      
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  }, [validationRules, values]);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback((submitHandler) => {
    return async (event) => {
      event.preventDefault();
      
      // Validate all fields
      const allErrors = {};
      Object.keys(validationRules).forEach(fieldName => {
        const validator = validationRules[fieldName];
        if (typeof validator === 'function') {
          const error = validator(values[fieldName], values);
          if (error) {
            allErrors[fieldName] = error;
          }
        }
      });

      setErrors(allErrors);
      
      if (Object.keys(allErrors).length > 0) {
        return;
      }

      setIsSubmitting(true);
      
      try {
        await submitHandler(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    };
  }, [values, validationRules]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  };
};

export default useForm;
