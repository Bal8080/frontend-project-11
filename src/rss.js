import { state } from "./state.js";
import { buildValidator, setI18n } from "./validators.js";

export const validateAndAddFeed = (url, i18n) => {
    setI18n(i18n);
    
    const validator = buildValidator(state.feeds);

    return validator.validate({ url }, { abortEarly: false})
      .then(() => {
        if (!state.feeds.includes(url)) {
            state.feeds.push(url);
        }
        return {valid: true, errors: null};
      })
      .catch((err) => {
        const errors = err.inner.reduce((acc, {path, message}) => {
            acc[path] = message;
            return acc;
        }, {});
        return {valid:false, errors}
      });
}