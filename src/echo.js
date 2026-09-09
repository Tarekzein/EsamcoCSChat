import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { config } from './config.js'

window.Pusher = Pusher

let echoInstance = null

function authorizeChannel(channelName, socketId, broadcastToken) {
  return fetch(`${config.apiBaseUrl}/api/public/live-chat/broadcasting/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Conversation-Token': broadcastToken,
    },
    body: JSON.stringify({ socket_id: socketId, channel_name: channelName }),
  }).then((response) => {
    if (!response.ok) throw new Error('Channel auth failed')
    return response.json()
  })
}

function connectEcho(broadcastToken) {
  if (echoInstance) return echoInstance

  echoInstance = new Echo({
    broadcaster: 'reverb',
    key: config.reverbKey,
    wsHost: config.reverbHost,
    wsPort: config.reverbPort,
    wssPort: config.reverbPort,
    forceTLS: config.reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
      authorize: (socketId, callback) => {
        authorizeChannel(channel.name, socketId, broadcastToken)
          .then((data) => callback(null, data))
          .catch((error) => callback(error, null))
      },
    }),
  })

  return echoInstance
}

export function disconnectEcho() {
  echoInstance?.disconnect()
  echoInstance = null
}

/**
 * Lets sendVisitorMessage() tell the backend which socket to exclude via
 * ->toOthers(), so the visitor doesn't get their own message echoed back
 * over the presence channel on top of the local optimistic append.
 */
export function getSocketId() {
  return echoInstance?.socketId() ?? null
}

/**
 * Joins the visitor's presence channel and reports whether the socket
 * actually subscribed, so the caller can fall back to polling if it
 * doesn't connect in time (unproven websocket reachability from an
 * arbitrary third-party host page).
 */
export function joinConversationChannel(
  uuid,
  broadcastToken,
  { onMessage, onTyping, onRead, onSubscribed, onError }
) {
  const echo = connectEcho(broadcastToken)
  const channelName = `live-chat.public-conversation.${uuid}`

  // Leave first (no-op if not currently joined) - re-joining without this
  // would bind a second set of listeners on top of any existing ones
  // (e.g. the visitor closing/reopening the widget), firing every
  // callback multiple times per event.
  echo.leave(channelName)

  echo
    .join(channelName)
    .here(() => onSubscribed?.())
    .listen('.message.sent', (payload) => onMessage?.(payload))
    .listen('.typing', (payload) => onTyping?.(payload))
    .listen('.messages.read', (payload) => onRead?.(payload))
    .error((error) => onError?.(error))
}
