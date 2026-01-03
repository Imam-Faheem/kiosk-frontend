import { guestValidationSchema } from '../schemas/guest.schema';

export const createGuestFormValidator = () => {
  return (values) => {
    try {
      guestValidationSchema.validateSync(values, { abortEarly: false });
      return {};
    } catch (err) {
      const errors = {};
      if (err.inner) {
        err.inner.forEach((error) => {
          errors[error.path] = error.message;
        });
      }
      return errors;
    }
  };
};

