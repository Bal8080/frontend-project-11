import axios from 'axios';
import { parseRSS } from './parser.js';
import { state } from "./state.js";
import { buildValidator, setI18n } from "./validators.js";

const ALL_ORIGINS_URL = 'https://api.allorigins.win/get';

const generateId = (str) => {
  let hash = 0;
  return Array.from(str).reduce((acc, char) => {
    const code = char.charCodeAt(0);
    return ((acc << 5) - acc + code) >>> 0;
  }, hash).toString();
};

export const validateAndAddFeed = (url, i18n) => {
    setI18n(i18n);
    
    const validator = buildValidator(Object.values(state.feeds).map((f) => f.url));

    return validator.validate({ url }, { abortEarly: false})
      .then(() => {
        const proxyUrl = `${ALL_ORIGINS_URL}?url=${encodeURIComponent(url)}&cache=false`;
        return axios.get(proxyUrl)
          .then(response => {
            const { contents } = response.data;
            console.log(contents);
            
            if (!contents) {
              throw new Error('Empty response from server');
            }

            // let xmlString;
            // if (contents.startsWith('data:')) {
            //   try {
            //     const base64Data = contents.split(',')[1];
            //     console.log(base64Data);
            //     if (!base64Data) {
            //       throw new Error('Invalid Data URL format');
            //     }
            //     xmlString = atob(base64Data);
            //   } catch (e) {
            //     throw new Error('Failed to decode base64 content');
            //   }
            // } else {
            //   xmlString = contents;
            // }

            console.log('START!!!');
            const parsed = parseRSS(contents);
            console.log('FINISH!!!');
            
            const feedId = parsed.feed.id || generateId(url);

            const isDuplicate = Object.values(state.feeds).some(feed => feed.url === url);
            if (isDuplicate) {
              throw new Error('RSS уже существует');
            }

            const normalizedFeed = {
              id: feedId,
              title: parsed.feed.title,
              description: parsed.feed.description,
              url,
            };

            const normalizedPosts = parsed.posts.map(post => ({
              id: post.id || generateId(post.link),
              title: post.title,
              link: post.link,
              published: post.published,
              feedId,cxmlStrin
            }));

            state.feeds = {
              ...state.feeds,
              [feedId]: normalizedFeed,
            };

            state.posts = {
              ...state.posts,
              ...normalizedPosts.reduce((acc, post) => {
                acc[post.id] = post;
                return acc;
              }, {}),
            };

            state.feedsOrder = [feedId, ...state.feedsOrder];

            return { valid: true, errors: null };
          })
          .catch(err => {
            let errorMessage = i18n.t('errors.network', 'Ошибка сети');
            if (err.message === 'Invalid RSS') {
              errorMessage = 'Неверный формат RSS';
            } else if (err.message === 'RSS уже существует') {
              errorMessage = i18n.t('errors.unique', 'RSS уже существует');
            }
            return { valid: false, errors: { url: errorMessage } };
          });
      })
      .catch((err) => {
        const errors = err.inner.reduce((acc, {path, message}) => {
            acc[path] = message;
            return acc;
        }, {});
        return {valid: false, errors}
      });
};