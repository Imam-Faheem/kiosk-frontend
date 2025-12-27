import { guestValidationSchema } from '../schemas/guest.schema';

export const createYupValidator = (schema = guestValidationSchema) => {
  return (values) => {
    try {
      schema.validateSync(values, { abortEarly: false });
      return {};
    } catch (error) {
      const errors = {};
      if (error.inner) {
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
      }
      return errors;
    }
  };
};

export const createGuestFormValidator = () => {
  return createYupValidator(guestValidationSchema);
};

export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};
