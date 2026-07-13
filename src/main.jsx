import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import css from './styles.css?inline'
import { store } from './store.js'
import App from './App.jsx'

function injectStyles() {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
}

function init() {
  injectStyles()

  const root = document.createElement('div')
  root.className = 'esamco-chat-widget'
  document.body.appendChild(root)

  createRoot(root).render(
    <Provider store={store}>
      <App />
    </Provider>
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
