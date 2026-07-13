import { fetchMessages } from './api.js'

let intervalId = null
let lastSeenId = 0

/**
 * Only activates as a fallback if the websocket doesn't subscribe in
 * time (see stateMachine.js's watchdog) - websocket reachability from an
 * arbitrary third-party host page isn't guaranteed.
 */
export function startPollingFallback(uuid, onMessages, intervalMs = 4000) {
  stopPollingFallback()

  intervalId = setInterval(async () => {
    try {
      const messages = await fetchMessages(uuid)
      const newMessages = messages.filter((m) => m.id > lastSeenId)

      if (newMessages.length) {
        lastSeenId = Math.max(...messages.map((m) => m.id))
        onMessages(newMessages)
      }
    } catch {
      // Transient network hiccup - next tick will retry.
    }
  }, intervalMs)
}

export function stopPollingFallback() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function markSeen(messageId) {
  lastSeenId = Math.max(lastSeenId, messageId)
}
