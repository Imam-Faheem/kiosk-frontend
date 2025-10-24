import * as yup from 'yup';

export const guestValidationSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim(),
  
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters')
    .lowercase()
    .trim(),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[\+]?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .trim(),
  
  country: yup
    .string()
    .max(50, 'Country must be less than 50 characters')
    .trim(),
  
  address: yup
    .string()
    .max(200, 'Address must be less than 200 characters')
    .trim()
});

export const guestInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  address: ''
};
