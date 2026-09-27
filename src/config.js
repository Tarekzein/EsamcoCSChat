// Defaults come from .env (VITE_* vars, baked in at build time). A host page
// can still override any of them by setting window.EsamcoChatConfig before
// loading the bundle, so the same build works across sites without a rebuild.
const userConfig = (typeof window !== 'undefined' && window.EsamcoChatConfig) || {}
const env = import.meta.env

export const config = {
  // Base URL of the Laravel backend (NOT the Python chatbot - the widget
  // only ever talks to Laravel, which proxies AI turns internally).
  apiBaseUrl: (userConfig.apiBaseUrl || env.VITE_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/+$/, ''),
  reverbKey: userConfig.reverbKey || env.VITE_REVERB_APP_KEY || '',
  reverbHost: userConfig.reverbHost || env.VITE_REVERB_HOST || '127.0.0.1',
  reverbPort: Number(userConfig.reverbPort || env.VITE_REVERB_PORT || 8080),
  reverbScheme: userConfig.reverbScheme || env.VITE_REVERB_SCHEME || 'http',
}
