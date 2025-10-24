import * as yup from 'yup';

export const checkinValidationSchema = yup.object({
  reservationId: yup
    .string()
    .required('Reservation ID is required')
    .min(3, 'Reservation ID must be at least 3 characters')
    .max(20, 'Reservation ID must be less than 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Reservation ID must contain only uppercase letters, numbers, and hyphens'),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
});

export const checkinInitialValues = {
  reservationId: '',
  lastName: ''
};
