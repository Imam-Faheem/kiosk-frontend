import i18n from '../config/i18n';

export const getTranslation = (lng = null) => {
  return i18n.getFixedT(lng || i18n.language);
};

export const translateError = (key, options = {}) => {
  const t = getTranslation();
  return t(`error.${key}`, options);
};

