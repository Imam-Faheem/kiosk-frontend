import * as yup from 'yup';

export const lostCardValidationSchema = yup.object({
  roomNumber: yup
    .string()
    .required('Room number is required')
    .matches(/^[0-9]+$/, 'Room number must contain only numbers')
    .min(1, 'Room number must be at least 1 digit')
    .max(10, 'Room number must be less than 10 digits'),
  
  reservationNumber: yup
    .string()
    .required('Reservation number is required')
    .min(3, 'Reservation number must be at least 3 characters')
    .max(20, 'Reservation number must be less than 20 characters')
    .matches(/^[A-Z0-9-]+$/, 'Reservation number must contain only uppercase letters, numbers, and hyphens'),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes')
    .trim()
});

export const lostCardInitialValues = {
  roomNumber: '',
  reservationNumber: '',
  lastName: ''
};
