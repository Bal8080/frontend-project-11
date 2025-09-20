import i18next from 'i18next'
import translation from './locales/ru/translation.js'

const createI18n = () => {
  const i18n = i18next.createInstance()

  i18n.init({
    lng: 'ru',
    initImmediate: false,
    resources: {
      ru: {
        translation,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  })

  return i18n
}

export default createI18n
