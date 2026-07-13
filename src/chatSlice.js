import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  sendChatbotMessage,
  fetchDepartments,
  submitHandoff,
  sendVisitorMessage,
  sendTypingSignal,
  markMessagesRead,
  fetchMessages,
  uploadAttachment,
} from './api.js'
import {
  getSessionId,
  setSessionId,
  getConversation,
  setConversation as persistConversation,
  clearConversation,
  clearIfExpired,
  touchActivity,
  getMessages,
} from './session.js'
import { joinConversationChannel, disconnectEcho } from './echo.js'
import { startPollingFallback, stopPollingFallback, markSeen } from './polling.js'

const WATCHDOG_MS = 4000

// Runs once when this module loads (app startup) - if the visitor's been
// gone 12+ hours, wipe the stale session/conversation/messages *before*
// initialState below reads them back in, so a genuinely stale visitor
// still starts fresh rather than resuming a half-day-old conversation.
clearIfExpired()

const initialState = {
  // 'closed' | 'ai_chat' | 'escalation_prompt' | 'lead_form' | 'live_chat'
  view: 'closed',
  // Restored across page refreshes (see store.js's persistence subscription)
  // so reloading the page doesn't wipe a visitor's conversation.
  messages: getMessages(), // { id, from: 'visitor' | 'ai' | 'agent' | 'system', text, at }
  sessionId: null,
  conversation: null, // { id, uuid, broadcast_token, assigned_agent }
  connectionStatus: 'idle', // 'idle' | 'connecting' | 'live' | 'polling'
  isWaitingForAnswer: false,
  agentTyping: false,
  departments: [],
  departmentsError: false,
  leadFormError: null,
  unreadCount: 0,
}

let messageId = Math.max(0, ...initialState.messages.map((m) => m.id))
const nextMessageId = () => ++messageId

export const askChatbot = createAsyncThunk('chat/askChatbot', async (query, { dispatch }) => {
  dispatch(appendMessage({ from: 'visitor', text: query }))

  try {
    const response = await sendChatbotMessage(query, getSessionId())
    setSessionId(response.session_id)
    dispatch(appendMessage({ from: 'ai', text: response.answer }))

    if (response.needs_human) {
      dispatch(setView('escalation_prompt'))
    }
  } catch {
    dispatch(
      appendMessage({
        from: 'ai',
        text: 'عذراً، حدث خطأ في الاتصال. هل تريد التحدث مع خدمة العملاء؟',
      })
    )
    dispatch(setView('escalation_prompt'))
  }
})

export const acceptEscalation = createAsyncThunk('chat/acceptEscalation', async (_, { dispatch }) => {
  dispatch(setView('lead_form'))
  dispatch(setDepartments([]))
  dispatch(setDepartmentsError(false))

  try {
    const departments = await fetchDepartments()
    dispatch(setDepartments(departments))
  } catch {
    dispatch(setDepartmentsError(true))
  }
})

export const submitLeadForm = createAsyncThunk(
  'chat/submitLeadForm',
  async ({ visitorName, visitorPhone, visitorEmail, departmentId }, { dispatch, getState }) => {
    const lastVisitorMessage = [...getState().chat.messages].reverse().find((m) => m.from === 'visitor')

    try {
      const conversation = await submitHandoff({
        visitorName,
        visitorPhone,
        visitorEmail,
        departmentId,
        sessionId: getSessionId(),
        message: lastVisitorMessage?.text,
      })

      persistConversation(conversation)
      dispatch(setConversation(conversation))
      dispatch(setView('live_chat'))
      dispatch(appendMessage({ from: 'system', text: 'جاري التحويل لممثل خدمة العملاء...' }))

      // The backend may have already appended its own system message
      // during creation (e.g. "all agents are busy") before this widget
      // ever joins the live channel, so a plain socket subscription would
      // miss it - fetch once to catch anything already there. The
      // visitor's own message is skipped since it's simply an echo of
      // what's already in the local transcript from the AI chat.
      try {
        const history = await fetchMessages(conversation.uuid)
        history
          .filter((m) => m.sender_type !== 'visitor')
          .forEach((m) =>
            dispatch(
              appendMessage({
                from: m.sender_type,
                text: m.message,
                messageType: m.message_type,
                serverId: m.id,
                status: m.is_read ? 'read' : 'sent',
              })
            )
          )
      } catch {
        // Non-critical - the socket/poll fallback started by
        // resumeLiveChat below will still deliver anything new from here on.
      }

      dispatch(resumeLiveChat({ conversation, refetchHistory: false }))
    } catch {
      dispatch(setLeadFormError('حدث خطأ، حاول مرة أخرى.'))
      throw new Error('handoff failed')
    }
  }
)

export const sendLiveChatMessage = createAsyncThunk(
  'chat/sendLiveChatMessage',
  async (message, { dispatch, getState }) => {
    const { conversation } = getState().chat
    touchActivity()
    dispatch(notifyTyping(false))
    // Appended only after the server confirms, using its real id - this is
    // what lets appendMessage() recognize (and skip) the echo of this same
    // message coming back over the socket or a poll tick.
    const sent = await sendVisitorMessage(conversation.id, message)
    dispatch(appendMessage({ from: 'visitor', text: sent.message, serverId: sent.id, status: 'sent' }))
  }
)

export const sendAttachment = createAsyncThunk(
  'chat/sendAttachment',
  async (file, { dispatch, getState, rejectWithValue }) => {
    const { conversation } = getState().chat
    touchActivity()

    try {
      const sent = await uploadAttachment(conversation.id, file)
      dispatch(
        appendMessage({
          from: 'visitor',
          text: sent.message,
          messageType: sent.message_type,
          fileName: file.name,
          serverId: sent.id,
          status: 'sent',
        })
      )
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
)

let isCurrentlyTyping = false

export const notifyTyping = createAsyncThunk('chat/notifyTyping', async (isTyping, { getState }) => {
  const { conversation } = getState().chat
  if (!conversation || isTyping === isCurrentlyTyping) return
  isCurrentlyTyping = isTyping

  try {
    await sendTypingSignal(conversation.id, isTyping)
  } catch {
    // Non-critical - a missed typing signal just means no indicator shows.
  }
})

export const markAgentMessagesRead = createAsyncThunk(
  'chat/markAgentMessagesRead',
  async (messageIds) => {
    try {
      await markMessagesRead(messageIds)
    } catch {
      // Non-critical - the agent just won't see a read receipt for this one.
    }
  }
)

export const openWidget = createAsyncThunk('chat/openWidget', async (_, { dispatch, getState }) => {
  // A visitor who's been gone 12+ hours starts fresh rather than resuming
  // a stale (likely already-closed) conversation or AI session.
  clearIfExpired()
  touchActivity()

  const conversation = getConversation()

  if (conversation && getState().chat.view !== 'live_chat') {
    dispatch(setConversation(conversation))
    dispatch(setView('live_chat'))
    // Refetch full history - this tab's local cache only has whatever it
    // saw itself; anything the agent sent while this tab was closed needs
    // to come from the backend.
    dispatch(resumeLiveChat({ conversation, refetchHistory: true }))
    return
  }

  if (getState().chat.view === 'closed') {
    dispatch(setView('ai_chat'))
  }
})

export const resumeLiveChat = createAsyncThunk(
  'chat/resumeLiveChat',
  async ({ conversation, refetchHistory }, { dispatch }) => {
    dispatch(setConnectionStatus('connecting'))

    if (refetchHistory) {
      try {
        const history = await fetchMessages(conversation.uuid)
        history.forEach((m) =>
          dispatch(
            appendMessage({
              from: m.sender_type,
              text: m.message,
              messageType: m.message_type,
              serverId: m.id,
              status: m.is_read ? 'read' : 'sent',
            })
          )
        )
      } catch {
        // Non-critical - the socket/poll will still deliver new messages
        // from here on, just without backfilling what was missed.
      }
    }

    const watchdog = setTimeout(() => {
      dispatch(setConnectionStatus('polling'))
      startPollingFallback(conversation.uuid, (newMessages) => {
        newMessages.forEach((m) => {
          dispatch(appendMessage({ from: m.sender_type, text: m.message, messageType: m.message_type, serverId: m.id }))
          if (m.sender_type === 'agent') dispatch(markAgentMessagesRead([m.id]))
        })
      })
    }, WATCHDOG_MS)

    joinConversationChannel(conversation.uuid, conversation.broadcast_token, {
      onSubscribed: () => {
        clearTimeout(watchdog)
        stopPollingFallback()
        dispatch(setConnectionStatus('live'))
      },
      onMessage: (message) => {
        markSeen(message.id)
        dispatch(
          appendMessage({
            from: message.sender_type,
            text: message.message,
            messageType: message.message_type,
            serverId: message.id,
          })
        )
        if (message.sender_type === 'agent') dispatch(markAgentMessagesRead([message.id]))
      },
      onTyping: (payload) => {
        if (payload.sender_type === 'agent') {
          dispatch(setAgentTyping(payload.typing))
        }
      },
      onRead: (payload) => {
        dispatch(applyReadReceipts(payload.message_ids))
      },
      onError: () => {
        // Watchdog will catch it and fall back to polling.
      },
    })
  }
)

export const teardown = createAsyncThunk('chat/teardown', async () => {
  disconnectEcho()
  stopPollingFallback()
})

export const endConversation = createAsyncThunk('chat/endConversation', async (_, { dispatch }) => {
  disconnectEcho()
  stopPollingFallback()
  clearConversation()
  dispatch(chatSlice.actions.reset())
})

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setView(state, action) {
      state.view = action.payload
      if (action.payload !== 'closed') state.unreadCount = 0
    },
    appendMessage(state, action) {
      const { serverId } = action.payload
      // Same message arriving twice - our own send echoed back over the
      // socket, or picked up again by a poll tick. Nothing to add.
      if (serverId != null && state.messages.some((m) => m.serverId === serverId)) {
        return
      }

      state.messages.push({ id: nextMessageId(), at: Date.now(), ...action.payload })
      if (state.view === 'closed' && action.payload.from !== 'visitor') {
        state.unreadCount += 1
      }
      // Seeing their message land means they're done typing.
      if (action.payload.from === 'agent') {
        state.agentTyping = false
      }
    },
    setConversation(state, action) {
      state.conversation = action.payload
    },
    setConnectionStatus(state, action) {
      state.connectionStatus = action.payload
    },
    setAgentTyping(state, action) {
      state.agentTyping = action.payload
    },
    applyReadReceipts(state, action) {
      const readIds = action.payload
      state.messages.forEach((m) => {
        if (m.serverId != null && readIds.includes(m.serverId)) {
          m.status = 'read'
        }
      })
    },
    setDepartments(state, action) {
      state.departments = action.payload
    },
    setDepartmentsError(state, action) {
      state.departmentsError = action.payload
    },
    setLeadFormError(state, action) {
      state.leadFormError = action.payload
    },
    reset() {
      return initialState
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askChatbot.pending, (state) => {
        state.isWaitingForAnswer = true
      })
      .addMatcher(
        (action) => action.type === askChatbot.fulfilled.type || action.type === askChatbot.rejected.type,
        (state) => {
          state.isWaitingForAnswer = false
        }
      )
      .addCase(submitLeadForm.pending, (state) => {
        state.leadFormError = null
      })
  },
})

export const {
  setView,
  appendMessage,
  setConversation,
  setConnectionStatus,
  setAgentTyping,
  applyReadReceipts,
  setDepartments,
  setDepartmentsError,
  setLeadFormError,
} = chatSlice.actions

export default chatSlice.reducer
