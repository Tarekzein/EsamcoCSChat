// Host page sets window.EsamcoChatConfig before loading the bundle, so the
// same build works across sites without a rebuild.
const userConfig = (typeof window !== 'undefined' && window.EsamcoChatConfig) || {}

export const config = {
  // Base URL of the Laravel backend (NOT the Python chatbot - the widget
  // only ever talks to Laravel, which proxies AI turns internally).
  apiBaseUrl: userConfig.apiBaseUrl || 'http://127.0.0.1:8001',
  reverbKey: userConfig.reverbKey || '',
  reverbHost: userConfig.reverbHost || '127.0.0.1',
  reverbPort: userConfig.reverbPort || 8081,
  reverbScheme: userConfig.reverbScheme || 'http',
}
