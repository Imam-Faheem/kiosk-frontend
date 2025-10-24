import * as yup from 'yup';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Email validation
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),

  // Password validation
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),

  // Phone validation
  phone: yup
    .string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .required('Phone number is required'),

  // Name validation
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),

  // Date validation
  date: yup
    .date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future'),

  // Required string
  requiredString: yup
    .string()
    .required('This field is required'),

  // Optional string
  optionalString: yup
    .string()
    .nullable()
    .optional(),
};

/**
 * Create a validation schema for a specific field
 * @param {string} fieldName - Name of the field
 * @param {object} options - Validation options
 * @returns {yup.Schema} Validation schema
 */
export const createFieldSchema = (fieldName, options = {}) => {
  const { required = true, minLength, maxLength, pattern, customMessage } = options;
  
  let schema = yup.string();
  
  if (required) {
    schema = schema.required(`${fieldName} is required`);
  }
  
  if (minLength) {
    schema = schema.min(minLength, `${fieldName} must be at least ${minLength} characters`);
  }
  
  if (maxLength) {
    schema = schema.max(maxLength, `${fieldName} must be less than ${maxLength} characters`);
  }
  
  if (pattern) {
    schema = schema.matches(pattern, customMessage || `Please enter a valid ${fieldName}`);
  }
  
  return schema;
};

/**
 * Validate form data against a schema
 * @param {object} data - Data to validate
 * @param {yup.Schema} schema - Validation schema
 * @returns {Promise<object>} Validation result
 */
export const validateFormData = async (data, schema) => {
  try {
    const validatedData = await schema.validate(data, { abortEarly: false });
    return { isValid: true, data: validatedData, errors: {} };
  } catch (error) {
    const errors = {};
    if (error.inner) {
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
    }
    return { isValid: false, data: null, errors };
  }
};

/**
 * Validate a single field
 * @param {any} value - Value to validate
 * @param {yup.Schema} schema - Validation schema
 * @returns {Promise<object>} Validation result
 */
export const validateField = async (value, schema) => {
  try {
    const validatedValue = await schema.validate(value);
    return { isValid: true, value: validatedValue, error: null };
  } catch (error) {
    return { isValid: false, value: null, error: error.message };
  }
};

/**
 * Create a conditional validation schema
 * @param {string} fieldName - Name of the field to check
 * @param {any} value - Value to check against
 * @param {yup.Schema} thenSchema - Schema to use if condition is true
 * @param {yup.Schema} otherwiseSchema - Schema to use if condition is false
 * @returns {yup.Schema} Conditional schema
 */
export const createConditionalSchema = (fieldName, value, thenSchema, otherwiseSchema) => {
  return yup.object().when(fieldName, {
    is: value,
    then: thenSchema,
    otherwise: otherwiseSchema,
  });
};

/**
 * Create a validation schema for nested objects
 * @param {object} nestedSchemas - Object containing nested schemas
 * @returns {yup.Schema} Nested validation schema
 */
export const createNestedSchema = (nestedSchemas) => {
  const schema = {};
  Object.keys(nestedSchemas).forEach(key => {
    schema[key] = nestedSchemas[key];
  });
  return yup.object().shape(schema);
};

/**
 * Create a validation schema for arrays
 * @param {yup.Schema} itemSchema - Schema for array items
 * @param {object} options - Array validation options
 * @returns {yup.Schema} Array validation schema
 */
export const createArraySchema = (itemSchema, options = {}) => {
  const { min = 0, max, required = false } = options;
  
  let schema = yup.array().of(itemSchema);
  
  if (required) {
    schema = schema.required('This field is required');
  }
  
  if (min > 0) {
    schema = schema.min(min, `At least ${min} items are required`);
  }
  
  if (max) {
    schema = schema.max(max, `Maximum ${max} items allowed`);
  }
  
  return schema;
};
