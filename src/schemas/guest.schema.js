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
    .matches(/^[+]?[\d\s\-()+()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .trim(),
  
  country: yup
    .string()
    .required('Country is required')
    .max(50, 'Country must be less than 50 characters')
    .trim(),

  addressStreet: yup
    .string()
    .required('Street address is required')
    .max(120, 'Street must be less than 120 characters')
    .trim(),

  addressCity: yup
    .string()
    .required('City is required')
    .max(80, 'City must be less than 80 characters')
    .trim(),

  addressState: yup
    .string()
    .required('State/Province is required')
    .max(80, 'State/Province must be less than 80 characters')
    .trim(),

  addressPostal: yup
    .string()
    .required('ZIP/Postal code is required')
    .max(20, 'ZIP/Postal must be less than 20 characters')
    .trim()
});

export const guestInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPostal: ''
};
