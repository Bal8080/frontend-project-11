import onChange from 'on-change'
import { initialState } from './state'
import { validateAndAddFeed, startAutoUpdate } from './rss'
import createI18n from './i18n.js'

let state = null

const runApp = (i18n) => {
  const form = document.querySelector('.rss-form')
  const urlInput = document.getElementById('url-input')
  const feedback = document.querySelector('.feedback')
  
  state = onChange(initialState, () => {
    console.log('CHANGED!!!')
    renderFeedsAndPosts()
  }, { isShallow: false })

  const renderError = (errorKey) => {
    urlInput.classList.add('is-invalid')
    feedback.textContent = i18n.t(`${errorKey}`)
  }

  const clearError = () => {
    urlInput.classList.remove('is-invalid')
    feedback.textContent = ''
  }

  const resetForm = () => {
    form.reset()
    clearError()
    urlInput.focus()
  }

  const renderFeedsAndPosts = () => {
    const postsListEl = document.getElementById('posts-list')
    const feedsContainerEl = document.getElementById('feeds-container')

    if (postsListEl) postsListEl.innerHTML = ''
    if (feedsContainerEl) feedsContainerEl.innerHTML = ''

    if (postsListEl) {
      const posts = Object.values(state.posts)

      const sortedPosts = posts
        .sort((a, b) => new Date(b.published || b.pubDate) - new Date(a.published || a.pubDate))

      const postElements = sortedPosts.length > 0
        ? sortedPosts
        : [{ title: 'Нет постов', link: '#', published: null, isPlaceholder: true }]

      const postsFragment = postElements
        .reduce((fragment, post) => {
          const li = document.createElement('li')
          if (post.isPlaceholder) {
            li.className = 'list-group-item text-muted text-center'
            li.textContent = post.title
          }
          else {
            li.className = 'list-group-item d-flex justify-content-between align-items-center'
            const titleClass = post.read ? 'fw-normal' : 'fw-bold'
            li.innerHTML = `
            <a href="${post.link}" target="_blank" rel="noopener noreferrer" class="${titleClass} me-auto">
              ${post.title}
            </a>
            <small class="text-muted">
              ${new Date(post.published).toLocaleDateString()}
            </small>
            <button 
              type="button"
              class="btn btn-outline-primary btn-sm ms-2"
              data-id="${post.id}"
              data-bs-toggle="modal"
              data-bs-target="#postModal"
            >
              👁️
            </button>
          `
          }
          fragment.appendChild(li)
          return fragment
        }, document.createDocumentFragment())

      postsListEl.appendChild(postsFragment)
    };

    if (feedsContainerEl) {
      const validFeeds = state.feedsOrder
        .map(id => state.feeds[id])
        .filter(Boolean)

      const feedElements = validFeeds.length > 0
        ? validFeeds
        : [{ title: 'Нет фидов', description: '', url: '', isPlaceholder: true }]

      const feedsFragment = feedElements
        .reduce((fragment, feed) => {
          const div = document.createElement('div')
          if (feed.isPlaceholder) {
            div.className = 'text-muted small text-center p-2'
            div.textContent = feed.title
          }
          else {
            div.className = 'p-3 mb-3 bg-white border rounded shadow-sm'
            div.innerHTML = `
            <h3 class="h6 mb-1 text-primary">${feed.title}</h3>
            <p class="text-muted small mb-1">${feed.description}</p>
            <small class="text-secondary">${feed.url}</small>
          `
          }
          fragment.appendChild(div)
          return fragment
        }, document.createDocumentFragment())

      feedsContainerEl.appendChild(feedsFragment)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (state.form.submitting) return
    state.form.submitting = true
    clearError()

    const url = urlInput.value.trim()

    validateAndAddFeed(url, i18n, state)
      .then((result) => {
        if (result.valid) {
          resetForm()
          console.log('Feed added:', url)
        }
        else {
          const firstError = Object.values(result.errors)[0]
          renderError(firstError)
          urlInput.focus()
        }
      })
      .catch((err) => {
        renderError('unknown')
        console.error(err)
      })
      .finally(() => {
        state.form.submitting = false
      })
  }

  const postsListEl = document.getElementById('posts-list')
  if (postsListEl) {
    postsListEl.addEventListener('click', (e) => {
      const button = e.target.closest('[data-id]')
      if (!button) return

      const postId = button.dataset.id
      const post = state.posts[postId]
      if (!post) return

      // 🔹 Помечаем как прочитанный
      post.read = true

      // 🔹 Обновляем стиль ссылки на лету
      const link = button.parentElement.querySelector('a')
      link.classList.remove('fw-bold')
      link.classList.add('fw-normal')

      // 🔹 Заполняем модальное окно
      document.getElementById('postModalLabel').textContent = post.title
      document.getElementById('postDescription').textContent = post.description || 'Нет описания'
      document.getElementById('postLink').href = post.link
    })
  }

  renderFeedsAndPosts()
  window.state = state

  form.addEventListener('submit', handleSubmit)

  startAutoUpdate(i18n, state)
}

const i18n = createI18n()
runApp(i18n)
