import { state } from "./state";
import { validateAndAddFeed } from "./rss";

const form = document.querySelector('.rss-form');
const urlInput = document.getElementById('url-input');
const feedback = document.querySelector('.feedback');

const renderError = (message) => {
    urlInput.classList.add('is-invalid');
    feedback.textContent = message;
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
    console.log('Run handleSubmit');

    e.preventDefault();

    if (state.form.submitting) return;
    state.form.submitting = true;

    const url = urlInput.value.trim();

    clearError();

    validateAndAddFeed(url)
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
        renderError('Произошла ошибка');
        console.error(err);
      })
      .finally(() => {
        state.form.submitting = false;
      });
};

const watch = () => {
    form.addEventListener('submit', handleSubmit);
};

watch();