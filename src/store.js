import { configureStore } from '@reduxjs/toolkit'
import chatReducer from './chatSlice.js'
import { setMessages } from './session.js'

export const store = configureStore({
  reducer: {
    chat: chatReducer,
  },
})

// Keeps the transcript across a page refresh (see chatSlice.js seeding
// initialState.messages from getMessages()) - otherwise only session_id/
// conversation survived a reload while the visible chat history didn't.
let previousMessages = store.getState().chat.messages
store.subscribe(() => {
  const { messages } = store.getState().chat
  if (messages !== previousMessages) {
    previousMessages = messages
    setMessages(messages)
  }
})
