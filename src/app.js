import * as yup from 'yup';
import onChange from 'on-change';

import render from './render.js'

const state = {
    urls: [],
}

const watchedState = onChange(state, () => render(state));

const feedback = document.querySelector('.feedback');
const urlInput = document.querySelector('#url-input');

function validateURL(url, urls) {
  const schema = yup.object().shape({
    url: yup.string().url().required().notOneOf(urls),
  });
    
  schema.validate({ url })
    .then((url) => watchedState.urls.push(url.url))
    .then(() => feedback.textContent = 'URL is valid')
    .then(() => console.log('promise', state.urls))
    .catch ((error) => {
      feedback.textContent = 'Validation failed:';
      urlInput.classList.add('is-invalid');
      console.error('Validation failed:', error.message);
  })
}

export default () => {
    const form = document.querySelector('.rss-form');

    form.addEventListener('submit',  (e) => {
        e.preventDefault();
        const url = document.querySelector('#url-input').value;
        validateURL(url, state.urls);
    })
}