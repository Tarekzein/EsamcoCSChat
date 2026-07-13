import { config } from './config.js'
import { getSocketId } from './echo.js'

async function postJson(path, body) {
  const socketId = getSocketId()
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' }
  // Lets Laravel's ->toOthers() exclude this exact socket, so the visitor
  // doesn't get their own message echoed back over the presence channel.
  if (socketId) headers['X-Socket-ID'] = socketId

  const response = await fetch(`${config.apiBaseUrl}/api/public/live-chat/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Request to ${path} failed: ${response.status}`)
  }

  return response.json()
}

export function sendChatbotMessage(query, sessionId) {
  return postJson('chatbot/message', { query, session_id: sessionId })
}

export async function fetchDepartments() {
  const response = await fetch(`${config.apiBaseUrl}/api/public/live-chat/chatbot/departments`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`Fetching departments failed: ${response.status}`)
  }

  const json = await response.json()
  return json.data ?? json
}

export function submitHandoff({ visitorName, visitorPhone, visitorEmail, departmentId, sessionId, message }) {
  return postJson('chatbot/handoff', {
    visitor_name: visitorName,
    visitor_phone: visitorPhone,
    visitor_email: visitorEmail || null,
    department_id: departmentId,
    session_id: sessionId,
    message,
  }).then((json) => json.data)
}

export function sendVisitorMessage(conversationId, message) {
  return postJson('message', { conversation_id: conversationId, message }).then((json) => json.data ?? json)
}

export async function uploadAttachment(conversationId, file) {
  const socketId = getSocketId()
  const headers = { Accept: 'application/json' }
  if (socketId) headers['X-Socket-ID'] = socketId

  const formData = new FormData()
  formData.append('conversation_id', conversationId)
  formData.append('file', file)

  const response = await fetch(`${config.apiBaseUrl}/api/public/live-chat/messages/attachment`, {
    method: 'POST',
    headers,
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Uploading attachment failed: ${response.status}`)
  }

  const json = await response.json()
  return json.data ?? json
}

export function sendTypingSignal(conversationId, typing) {
  return postJson('messages/typing', { conversation_id: conversationId, typing })
}

export function markMessagesRead(messageIds) {
  return postJson('messages/read', { message_ids: messageIds })
}

export async function fetchMessages(uuid) {
  const response = await fetch(
    `${config.apiBaseUrl}/api/public/live-chat/conversation/${uuid}/messages`,
    { headers: { Accept: 'application/json' } }
  )

  if (!response.ok) {
    throw new Error(`Fetching messages failed: ${response.status}`)
  }

  const json = await response.json()
  return json.data ?? json
}
