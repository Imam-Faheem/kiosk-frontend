import * as yup from 'yup';

export const roomSearchValidationSchema = yup.object({
  checkIn: yup
    .date()
    .required('Check-in date is required')
    .min(new Date(), 'Check-in date cannot be in the past'),
  
  checkOut: yup
    .date()
    .required('Check-out date is required')
    .min(yup.ref('checkIn'), 'Check-out date must be after check-in date')
    .test('min-stay', 'Minimum stay is 1 night', function(value) {
      const { checkIn } = this.parent;
      if (!checkIn || !value) return true;
      const diffTime = new Date(value) - new Date(checkIn);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 1;
    }),
  
  guests: yup
    .string()
    .required('Number of guests is required')
    .test('is-valid-number', 'Please select number of guests', (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= 1 && num <= 8;
    })
});

export const roomSearchInitialValues = {
  checkIn: new Date(),
  checkOut: null,
  guests: '1'
};

export const bookingValidationSchema = yup.object({
  roomTypeId: yup
    .string()
    .required('Room type is required'),
  
  checkIn: yup
    .date()
    .required('Check-in date is required'),
  
  checkOut: yup
    .date()
    .required('Check-out date is required')
    .min(yup.ref('checkIn'), 'Check-out date must be after check-in date'),
  
  guests: yup
    .number()
    .required('Number of guests is required')
    .min(1, 'At least 1 guest is required')
    .max(8, 'Maximum 8 guests allowed'),
  
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
});

export const bookingInitialValues = {
  roomTypeId: '',
  checkIn: '',
  checkOut: '',
  guests: 1,
  termsAccepted: false
};
