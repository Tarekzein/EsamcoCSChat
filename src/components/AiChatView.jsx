import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { askChatbot, acceptEscalation, setView } from '../chatSlice.js'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { SendIcon, SupportIcon } from '../icons.jsx'

const IDLE_ESCALATION_MS = 5 * 60 * 1000 // 5 minutes

export default function AiChatView() {
  const dispatch = useDispatch()
  const messages = useSelector((s) => s.chat.messages)
  const isWaitingForAnswer = useSelector((s) => s.chat.isWaitingForAnswer)
  const view = useSelector((s) => s.chat.view)
  const [value, setValue] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, isWaitingForAnswer, view])

  // Proactively offers a handoff after 5 minutes of no activity at all
  // (no typing, no send) while just idling on the plain chat view - reset
  // by any keystroke or by messages.length changing (sending/receiving).
  useEffect(() => {
    if (view !== 'ai_chat') return

    const timer = setTimeout(() => {
      dispatch(setView('escalation_prompt'))
    }, IDLE_ESCALATION_MS)

    return () => clearTimeout(timer)
  }, [dispatch, view, messages.length, value])

  const send = () => {
    const query = value.trim()
    if (!query) return
    setValue('')
    dispatch(askChatbot(query))
  }

  return (
    <>
      <div className="esamco-chat-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="esamco-chat-welcome">
            👋 أهلاً بك! اسألني أي شيء عن خدماتنا وسأحاول مساعدتك فوراً.
          </div>
        )}

        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} />
        ))}

        {isWaitingForAnswer && <TypingIndicator />}

        {view === 'escalation_prompt' && (
          <div className="esamco-chat-prompt">
            <div className="esamco-chat-prompt-icon">
              <SupportIcon />
            </div>
            <div className="esamco-chat-prompt-text">هل تريد التحدث مع خدمة العملاء؟</div>
            <div className="esamco-chat-prompt-actions">
              <button
                type="button"
                data-action="yes"
                className="esamco-chat-btn primary"
                onClick={() => dispatch(acceptEscalation())}
              >
                نعم، أريد ذلك
              </button>
              <button
                type="button"
                data-action="no"
                className="esamco-chat-btn secondary"
                onClick={() => dispatch(setView('ai_chat'))}
              >
                لا، شكراً
              </button>
            </div>
          </div>
        )}
      </div>

      {view !== 'escalation_prompt' && (
        <div className="esamco-chat-input-row">
          <input
            type="text"
            placeholder="اكتب رسالتك..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="esamco-chat-send-btn" onClick={send} aria-label="إرسال">
            <SendIcon />
          </button>
        </div>
      )}
    </>
  )
}
