import { SingleCheckIcon, DoubleCheckIcon, DocumentIcon } from '../icons.jsx'

const SENDER_CLASS = { visitor: 'visitor', ai: 'ai', agent: 'agent', system: 'system' }

const SENDER_LABEL = { agent: 'ممثل خدمة العملاء', ai: 'المساعد الذكي' }

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

function fileNameFromUrl(url) {
  try {
    const last = decodeURIComponent(url.split('/').pop())
    const underscoreIndex = last.indexOf('_')
    return underscoreIndex > -1 ? last.slice(underscoreIndex + 1) : last
  } catch {
    return 'ملف'
  }
}

function MessageContent({ text, messageType, fileName }) {
  if (messageType === 'image') {
    return (
      <a href={text} target="_blank" rel="noreferrer">
        <img src={text} alt="مرفق" className="esamco-chat-attachment-image" />
      </a>
    )
  }

  if (messageType === 'file') {
    return (
      <a href={text} target="_blank" rel="noreferrer" className="esamco-chat-attachment-file">
        <DocumentIcon />
        <span>{fileName || fileNameFromUrl(text)}</span>
      </a>
    )
  }

  return <div className="esamco-chat-message-text">{text}</div>
}

export default function MessageBubble({ from, text, at, status, messageType, fileName }) {
  const label = SENDER_LABEL[from]

  return (
    <div className={`esamco-chat-message ${SENDER_CLASS[from] || 'ai'}`}>
      {label && <div className="esamco-chat-message-label">{label}</div>}
      <MessageContent text={text} messageType={messageType} fileName={fileName} />
      <div className="esamco-chat-message-time">
        {formatTime(at)}
        {from === 'visitor' && status && (
          <span className={`esamco-chat-status-icon ${status}`}>
            {status === 'read' ? <DoubleCheckIcon /> : <SingleCheckIcon />}
          </span>
        )}
      </div>
    </div>
  )
}
