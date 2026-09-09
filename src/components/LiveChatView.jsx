import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { sendLiveChatMessage, sendAttachment, notifyTyping } from '../chatSlice.js'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import { SendIcon, PaperclipIcon } from '../icons.jsx'

const STATUS_LABEL = {
  connecting: 'جاري الاتصال...',
  live: 'متصل مباشر',
  polling: 'جاري التحديث...',
  idle: 'جاري الاتصال...',
}

const TYPING_STOP_DELAY_MS = 2000
const MAX_ATTACHMENT_MB = 10
const ACCEPTED_ATTACHMENTS = '.pdf,.doc,.docx,image/*'

export default function LiveChatView() {
  const dispatch = useDispatch()
  const messages = useSelector((s) => s.chat.messages)
  const connectionStatus = useSelector((s) => s.chat.connectionStatus)
  const conversation = useSelector((s) => s.chat.conversation)
  const agentTyping = useSelector((s) => s.chat.agentTyping)
  const [value, setValue] = useState('')
  const [uploading, setUploading] = useState(false)
  const [attachmentError, setAttachmentError] = useState(null)
  const scrollRef = useRef(null)
  const stopTypingTimer = useRef(null)
  const fileInputRef = useRef(null)
  // Set while the picker was opened from a specific form's "send the
  // filled copy" button, so the upload can name the request it answers.
  const answeringRequestRef = useRef(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, agentTyping])

  useEffect(() => {
    return () => {
      clearTimeout(stopTypingTimer.current)
      dispatch(notifyTyping(false))
    }
  }, [dispatch])

  const handleChange = (e) => {
    setValue(e.target.value)
    dispatch(notifyTyping(true))

    clearTimeout(stopTypingTimer.current)
    stopTypingTimer.current = setTimeout(() => dispatch(notifyTyping(false)), TYPING_STOP_DELAY_MS)
  }

  const send = () => {
    const message = value.trim()
    if (!message) return
    setValue('')
    clearTimeout(stopTypingTimer.current)
    dispatch(sendLiveChatMessage(message))
  }

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = '' // lets the same file be picked again later

    const documentRequestId = answeringRequestRef.current
    answeringRequestRef.current = null

    if (!file) return

    setAttachmentError(null)

    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setAttachmentError(`حجم الملف أكبر من ${MAX_ATTACHMENT_MB} ميجابايت`)
      return
    }

    setUploading(true)
    try {
      await dispatch(sendAttachment({ file, documentRequestId })).unwrap()
    } catch {
      setAttachmentError('تعذر رفع الملف، حاول مرة أخرى.')
    } finally {
      setUploading(false)
    }
  }

  const handleReturnFile = (documentRequestId) => {
    answeringRequestRef.current = documentRequestId
    fileInputRef.current?.click()
  }

  return (
    <>
      <div className="esamco-chat-messages" ref={scrollRef}>
        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} onReturnFile={handleReturnFile} />
        ))}
        {agentTyping && <TypingIndicator />}
      </div>

      {attachmentError && <div className="esamco-chat-form-error esamco-chat-attachment-error">{attachmentError}</div>}

      <div className="esamco-chat-input-row">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_ATTACHMENTS}
          hidden
          onChange={handleFileSelected}
        />
        <button
          type="button"
          className="esamco-chat-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label="إرفاق ملف"
        >
          <PaperclipIcon />
        </button>
        <input
          type="text"
          placeholder="اكتب رسالتك..."
          value={value}
          onChange={handleChange}
          onKeyDown={(e) => e.key === 'Enter' && send()}
        />
        <button type="button" className="esamco-chat-send-btn" onClick={send} aria-label="إرسال">
          <SendIcon />
        </button>
      </div>

      <div className="esamco-chat-status">
        <span className={`esamco-chat-status-dot ${connectionStatus}`} />
        {uploading ? 'جاري رفع الملف...' : STATUS_LABEL[connectionStatus]}
        {conversation?.assigned_agent && ` · ${conversation.assigned_agent.name}`}
      </div>
    </>
  )
}
