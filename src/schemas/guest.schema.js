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
    .matches(/^[+]?[\d\s\-()+()]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be less than 20 characters')
    .trim(),

  birthDate: yup
    .string()
    .required('Birth date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Birth date must be in YYYY-MM-DD format')
    .trim(),

  documentType: yup
    .string()
    .required('Document type is required')
    .oneOf(['Passport', 'IdCard', 'DriverLicense'], 'Please select a valid document type'),

  documentNumber: yup
    .string()
    .required('Document number is required')
    .max(50, 'Document number must be less than 50 characters')
    .trim(),

  birthPlace: yup
    .string()
    .max(100, 'Birth place must be less than 100 characters')
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .optional(),

  nationalityCountryCode: yup
    .string()
    .max(2, 'Nationality country code must be 2 characters')
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .optional(),
  
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

  // Optional (the UI does not currently collect state/province)
  addressState: yup
    .string()
    .max(80, 'State/Province must be less than 80 characters')
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .optional(),

  addressPostal: yup
    .string()
    .required('ZIP/Postal code is required')
    .max(20, 'ZIP/Postal must be less than 20 characters')
    .trim(),

  travelPurpose: yup
    .string()
    .oneOf(['Business', 'Leisure', 'Other'], 'Please select a valid travel purpose')
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .optional(),

  guestComment: yup
    .string()
    .max(500, 'Comments must be less than 500 characters')
    .nullable()
    .transform((val) => (val === '' ? null : val))
    .optional(),
});

export const guestInitialValues = {
  title: 'Mr',
  gender: 'Male',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  birthDate: '',
  birthPlace: '',
  nationalityCountryCode: '',
  documentType: 'Passport',
  documentNumber: '',
  country: '',
  addressStreet: '',
  addressCity: '',
  addressState: '',
  addressPostal: '',
  travelPurpose: 'Business',
  guestComment: '',
};
