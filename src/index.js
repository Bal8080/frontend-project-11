import onChange from 'on-change';
import { initialState } from "./state";
import { validateAndAddFeed, startAutoUpdate } from "./rss";
import createI18n from './i18n.js';

export let state = null;
window.state = state;

const runApp = (i18n) => {
  const form = document.querySelector('.rss-form');
  const urlInput = document.getElementById('url-input');
  const feedback = document.querySelector('.feedback');
  const resultsSection = document.querySelector('.section-results');

  state = onChange(initialState, () => {
    console.log('CHANGED!!!');
    renderFeedsAndPosts();
  }, { isShallow: false });
  
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
    // resultsSection.innerHTML = '';
    const postsListEl = document.getElementById('posts-list');
    const feedsContainerEl = document.getElementById('feeds-container');

    if (postsListEl) postsListEl.innerHTML = '';
    if (feedsContainerEl) feedsContainerEl.innerHTML = '';

    // if (state.feedsOrder.length === 0) return;

    // const feedElements = state.feedsOrder
    //   .map((feedId) => {
    //     const feed = state.feeds[feedId];
    //     if (!feed) return null;

    //     const posts = Object.values(state.posts)
    //       .filter((post) => post.feedId === feedId)
    //       .map((post) => 
    //         `<li class="list-group-item">
    //             <a href="${post.link}" target="_blank" rel="noopener noreferrer">
    //               ${post.title}
    //             </a>
    //           </li>`
    //       )
    //       .join('');

    //       const feedEl = document.createElement('div');
    //       feedEl.className = 'mb-5 p-4 bg-light rounded shadow-sm';
    //       feedEl.innerHTML = `
    //         <h3 class="h4 text-primary">${feed.title}</h3>
    //         <p class="text-muted">${feed.description}</p>
    //         <ul class="list-group list-group-flush">${posts}</ul>
    //       `;

    //       return feedEl;
    //   })
    //   .filter(Boolean);

    // feedElements.forEach((el) => resultsSection.appendChild(el));

    if (postsListEl) {
    const posts = Object.values(state.posts);

    const sortedPosts = posts
      .sort((a, b) => new Date(b.published || b.pubDate) - new Date(a.published || a.pubDate));

    const postElements = sortedPosts.length > 0
      ? sortedPosts
      : [{ title: 'Нет постов', link: '#', published: null, isPlaceholder: true }];

    const postsFragment = postElements
      .reduce((fragment, post) => {
        const li = document.createElement('li');
        if (post.isPlaceholder) {
          li.className = 'list-group-item text-muted text-center';
          li.textContent = post.title;
        } else {
          li.className = 'list-group-item d-flex justify-content-between align-items-center';
          li.innerHTML = `
            <a href="${post.link}" target="_blank" rel="noopener noreferrer">
              ${post.title}
            </a>
            <small class="text-muted">
              ${new Date(post.published).toLocaleDateString()}
            </small>
          `;
        }
        fragment.appendChild(li);
        return fragment;
      }, document.createDocumentFragment());

    postsListEl.appendChild(postsFragment);
    };

    if (feedsContainerEl) {
    const validFeeds = state.feedsOrder
      .map(id => state.feeds[id])
      .filter(Boolean);

    const feedElements = validFeeds.length > 0
      ? validFeeds
      : [{ title: 'Нет фидов', description: '', url: '', isPlaceholder: true }];

    const feedsFragment = feedElements
      .reduce((fragment, feed) => {
        const div = document.createElement('div');
        if (feed.isPlaceholder) {
          div.className = 'text-muted small text-center p-2';
          div.textContent = feed.title;
        } else {
          div.className = 'p-3 mb-3 bg-white border rounded shadow-sm';
          div.innerHTML = `
            <h3 class="h6 mb-1 text-primary">${feed.title}</h3>
            <p class="text-muted small mb-1">${feed.description}</p>
            <small class="text-secondary">${feed.url}</small>
          `;
        }
        fragment.appendChild(div);
        return fragment;
      }, document.createDocumentFragment());

    feedsContainerEl.appendChild(feedsFragment);
  }
  };
  
  const handleSubmit = (e) => {
      e.preventDefault();
  
      if (state.form.submitting) return;
      state.form.submitting = true;
      clearError();
  
      const url = urlInput.value.trim();
      
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

  // onChange(state, () => {
  //   console.log('CHANGED!!!');
  //   renderFeedsAndPosts();
  // }, { isShallow: false });

  renderFeedsAndPosts();

  form.addEventListener('submit', handleSubmit);

  startAutoUpdate(i18n);
};



const i18n = createI18n();
runApp(i18n);