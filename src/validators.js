import * as yup from "yup";

let i18nInstance;

export const setI18n = (i18n) => {
  i18nInstance = i18n;
};



export const buildValidator = (existingFeeds) => {
  if (!i18nInstance) {
    throw new Error('i18n not initialized. Call setI18n() first.');
  }

  return yup.object().shape({
    url: yup
      .string()
      .required(i18nInstance.t('errors.required'))
      .url(i18nInstance.t('errors.url'))
      .test('unique', i18nInstance.t('errors.unique'), (value) => {
        if (!value) return true;
        return !existingFeeds.includes(value.trim());
      }),
  });
};