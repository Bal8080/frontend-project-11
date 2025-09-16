import axios from 'axios';
import { parseRSS } from './parser.js';
import { state } from "./index.js";
import { buildValidator, setI18n } from "./validators.js";

const ALL_ORIGINS_URL = 'https://allorigins.hexlet.app/get';

const generateId = (str) => {
  let hash = 0;
  return Array.from(str).reduce((acc, char) => {
    const code = char.charCodeAt(0);
    return ((acc << 5) - acc + code) >>> 0;
  }, hash).toString();
};

const validateAndAddFeed = (url, i18n) => {
    setI18n(i18n);
    
    const validator = buildValidator(Object.values(state.feeds).map((f) => f.url));

    return validator.validate({ url }, { abortEarly: false})
      .then(() => {
        const proxyUrl = `${ALL_ORIGINS_URL}?url=${encodeURIComponent(url)}&cache=false`;
        return axios.get(proxyUrl)
          .then(response => {
            console.log(`RESPONSE!!! ${Object.keys(response)}`);
            const { contents } = response.data;
            console.log(`CONTENTS!!! ${contents}`);
            
            if (!contents) {
              throw new Error('Empty response from server');
            }

            console.log('START!!!');
            const parsed = parseRSS(contents);
            console.log(`PARSED!!!! ${parsed}`);
            
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
              feedId,
            }));

            Object.assign(state.feeds, { [feedId]: normalizedFeed });

            Object.assign(
              state.posts,
              normalizedPosts.reduce((acc, post) => {
                acc[post.id] = post;
                return acc;
              }, {})
            );

            state.feedsOrder.unshift(feedId);

            return { valid: true, errors: null };
          })
          .catch(err => {
            let errorMessage = i18n.t('errors.network', 'Ошибка сети');
            console.log(err);
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

const fetchFeed = (url) => {
  const proxyUrl = `${ALL_ORIGINS_URL}?url=${encodeURIComponent(url)}&cache=false`;
  return axios.get(proxyUrl)
    .then(response => {
      if (!response.data.contents) {
        throw new Error('Empty response');
      }
      return parseRSS(response.data.contents);
    })
    .catch((err) => {
      console.warn(`Ошибка при загрузке фида: ${url}`, err.message);
      // Не останавливаем другие фиды — резолвим в null
      return null;
    });
};

const checkForUpdates = (i18n) => {
  console.log('Checking for updates...');

  const feedUrls = Object.values(state.feeds).map(feed => ({
    id: feed.id,
    url: feed.url,
  }));

  // Массив промисов для каждого фида
  const updatePromises = feedUrls.map(({ id: feedId, url }) => {
    return fetchFeed(url)
      .then(parsed => {
        if (!parsed) return; // ошибка или пусто

        const existingLinks = new Set(Object.values(state.posts).map(p => p.link));

        const newPosts = parsed.posts
          .filter(post => !existingLinks.has(post.link))
          .map(post => ({
            id: post.id || generateId(post.link),
            title: post.title,
            link: post.link,
            published: post.published,
            feedId,
          }));

        // Добавляем новые посты
        if (newPosts.length > 0) {
          newPosts.forEach(post => {
            state.posts[post.id] = post;
          });
          console.log(`Добавлено новых постов для фида ${feedId}: ${newPosts.length}`);
        }
      });
  });

  // Ждём все промисы (даже если некоторые упали)
  return Promise.allSettled(updatePromises)
    .then(() => {
      console.log('Проверка завершена. Следующая — через 5 секунд.');
    })
    .catch(err => {
      console.error('Ошибка в Promise.allSettled:', err);
    });
};

const startAutoUpdate = (i18n) => {
  const updateLoop = () => {
    checkForUpdates(i18n)
      .then(() => {
        setTimeout(updateLoop, 5000); // запускаем следующую проверку через 5 сек
      })
      .catch((err) => {
        console.error('Ошибка при обновлении:', err);
        setTimeout(updateLoop, 5000); // всё равно продолжаем
      });
  };

  // Первая проверка через 5 секунд
  setTimeout(updateLoop, 5000);
};

export { validateAndAddFeed, startAutoUpdate }