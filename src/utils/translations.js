import i18n from '../config/i18n';

/**
 * Get translation function for use outside React components (e.g., in services)
 * @param {string} lng - Language code (optional, defaults to current language)
 * @returns {Function} Translation function
 */
export const getTranslation = (lng = null) => {
  return i18n.getFixedT(lng || i18n.language);
};

/**
 * Translate an error message key
 * @param {string} key - Translation key
 * @param {Object} options - Translation options
 * @returns {string} Translated string
 */
export const translateError = (key, options = {}) => {
  const t = getTranslation();
  return t(`error.${key}`, options);
};

