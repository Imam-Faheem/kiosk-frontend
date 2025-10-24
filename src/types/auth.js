import * as yup from 'yup';

// Login form validation schema
export const loginSchema = yup.object({
  username: yup
    .string()
    .required('Username or email is required')
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
});

// Registration form validation schema
export const registerSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number'),
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date(1900, 0, 1), 'Date of birth must be after 1900'),
});

// Password reset schema
export const passwordResetSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

// New password schema
export const newPasswordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

// Profile update schema
export const profileUpdateSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^\+?[\d\s\-()]+$/, 'Please enter a valid phone number'),
  dateOfBirth: yup
    .date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future')
    .min(new Date(1900, 0, 1), 'Date of birth must be after 1900'),
});

// Change password schema
export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'New password must be less than 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmNewPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match'),
});

// Default values for forms
export const defaultValues = {
  login: {
    username: '',
    password: '',
  },
  register: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: null,
  },
  passwordReset: {
    email: '',
  },
  newPassword: {
    password: '',
    confirmPassword: '',
  },
  profileUpdate: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: null,
  },
  changePassword: {
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  },
};
