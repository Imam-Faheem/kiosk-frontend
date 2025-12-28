import * as yup from 'yup';

export const guestValidationSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .oneOf(['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'], 'Please select a valid title'),
  
  gender: yup
    .string()
    .required('Gender is required')
    .oneOf(['Male', 'Female', 'Other'], 'Please select a valid gender'),
  
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

  addressPostal: yup
    .string()
    .required('ZIP/Postal code is required')
    .max(20, 'ZIP/Postal must be less than 20 characters')
    .trim(),
  
  nationalityCountryCode: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .max(2, 'Nationality must be a 2-letter country code'),
  
  birthDate: yup
    .string()
    .required('Date of birth is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format'),
  
  birthPlace: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .max(100, 'Birth place must be less than 100 characters'),
  
  documentType: yup
    .string()
    .required('ID Type is required')
    .oneOf(['Passport', 'ID', 'DrivingLicense'], 'Please select a valid document type'),
  
  documentNumber: yup
    .string()
    .required('ID Number is required')
    .max(50, 'Document number must be less than 50 characters'),
  
  documentIssueDate: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .matches(/^\d{4}-\d{2}-\d{2}$|^$/, 'Issue date must be in YYYY-MM-DD format'),
  
  documentExpiryDate: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .matches(/^\d{4}-\d{2}-\d{2}$|^$/, 'Expiry date must be in YYYY-MM-DD format'),
  
  documentIssuingCountry: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .max(2, 'Issuing country must be a 2-letter country code'),
  
  guestComment: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .max(500, 'Comment must be less than 500 characters'),
  
  travelPurpose: yup
    .string()
    .nullable()
    .transform((value) => value === '' ? null : value)
    .oneOf(['Business', 'Leisure', 'Other', null], 'Please select a valid travel purpose'),
});

export const guestInitialValues = {
  title: '',
  gender: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  country: '',
  addressStreet: '',
  addressCity: '',
  addressPostal: '',
  nationalityCountryCode: '',
  birthDate: '',
  birthPlace: '',
  documentType: '',
  documentNumber: '',
  documentIssueDate: '',
  documentExpiryDate: '',
  documentIssuingCountry: '',
  guestComment: '',
  travelPurpose: '',
};
