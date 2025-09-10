import onChange from 'on-change';
import { state } from "./state";
import { validateAndAddFeed } from "./rss";
import createI18n from './i18n.js';

window.state = state;

const runApp = (i18n) => {
  const form = document.querySelector('.rss-form');
  const urlInput = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');
  const resultsSection = document.querySelector('.section-results');
  
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

  const renderFeedsAndPosts = () => {
    resultsSection.innerHTML = '';

    if (state.feedsOrder.length === 0) return;

    const feedElements = state.feedsOrder
      .map((feedId) => {
        const feed = state.feeds[feedId];
        if (!feed) return null;

        const posts = Object.values(state.posts)
          .filter((post) => post.feedId === feedId)
          .map((post) => 
            `<li class="list-group-item">
                <a href="${post.link}" target="_blank" rel="noopener noreferrer">
                  ${post.title}
                </a>
              </li>`
          )
          .join('');

          const feedEl = document.createElement('div');
          feedEl.className = 'mb-5 p-4 bg-light rounded shadow-sm';
          feedEl.innerHTML = `
            <h3 class="h4 text-primary">${feed.title}</h3>
            <p class="text-muted">${feed.description}</p>
            <ul class="list-group list-group-flush">${posts}</ul>
          `;

          return feedEl;
      })
      .filter(Boolean);

    feedElements.forEach((el) => resultsSection.appendChild(el));
  };
  
  const handleSubmit = (e) => {
      e.preventDefault();
  
      if (state.form.submitting) return;
      state.form.submitting = true;
      clearError();
  
      const url = urlInput.value.trim();
      console.log(url);
  
      validateAndAddFeed(url, i18n)
        .then((result) => {
          console.log(result)
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

  onChange(state, () => {
    renderFeedsAndPosts();
  }, { isShallow: false });

  renderFeedsAndPosts();

  form.addEventListener('submit', handleSubmit);
};

const i18n = createI18n();
runApp(i18n);