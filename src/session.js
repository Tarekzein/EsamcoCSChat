const SESSION_KEY = 'esamco_chat_session_id'
const CONVERSATION_KEY = 'esamco_chat_conversation'
const LAST_ACTIVITY_KEY = 'esamco_chat_last_activity'
const MESSAGES_KEY = 'esamco_chat_messages'

const INACTIVITY_LIMIT_MS = 12 * 60 * 60 * 1000 // 12 hours

export function touchActivity() {
  localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()))
}

/**
 * Wipes the session/conversation if the visitor hasn't done anything for
 * 12+ hours, so a returning visitor starts fresh rather than resuming a
 * half-day-old (possibly already-closed) conversation. Call once at
 * startup, before anything reads getSessionId()/getConversation().
 */
export function clearIfExpired() {
  const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY))
  const expired = !last || Date.now() - last > INACTIVITY_LIMIT_MS

  if (expired) {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(CONVERSATION_KEY)
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    localStorage.removeItem(MESSAGES_KEY)
  }

  return expired
}

export function getSessionId() {
  return localStorage.getItem(SESSION_KEY)
}

export function setSessionId(sessionId) {
  localStorage.setItem(SESSION_KEY, sessionId)
  touchActivity()
}

export function getConversation() {
  const raw = localStorage.getItem(CONVERSATION_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setConversation(conversation) {
  localStorage.setItem(CONVERSATION_KEY, JSON.stringify(conversation))
  touchActivity()
}

export function clearConversation() {
  localStorage.removeItem(CONVERSATION_KEY)
}

export function getMessages() {
  const raw = localStorage.getItem(MESSAGES_KEY)
  return raw ? JSON.parse(raw) : []
}

export function setMessages(messages) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}
