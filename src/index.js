import { state } from "./state";
import { validateAndAddFeed } from "./rss";
import createI18n from './i18n.js';

const runApp = (i18n) => {
  const form = document.querySelector('.rss-form');
  const urlInput = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');
  
  const renderError = (errorKey) => {
      urlInput.classList.add('is-invalid');
      feedback.textContent = i18n.t(`${errorKey}`);
  };
  
  const clearError = () => {
    urlInput.classList.remove('is-invalid');
    feedback.textContent = '';
  };
  
  const resetForm = () => {
    form.reset();
    clearError();
    urlInput.focus();
  };
  
  const handleSubmit = (e) => {
      e.preventDefault();
  
      if (state.form.submitting) return;
      state.form.submitting = true;
  
      const url = urlInput.value.trim();
  
      clearError();
  
      validateAndAddFeed(url, i18n)
        .then((result) => {
          if (result.valid) {
              resetForm();
              console.log('Feed added:', url);
          } else {
              const firstError = Object.values(result.errors)[0];
              renderError(firstError);
              urlInput.focus();
          }
        })
        .catch((err) => {
          renderError('unknown');
          console.error(err);
        })
        .finally(() => {
          state.form.submitting = false;
        });
  };

  form.addEventListener('submit', handleSubmit);
};

const i18n = createI18n();
runApp(i18n);