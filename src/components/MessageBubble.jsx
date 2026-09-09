import { SingleCheckIcon, DoubleCheckIcon, DocumentIcon } from '../icons.jsx'

const SENDER_CLASS = { visitor: 'visitor', ai: 'ai', agent: 'agent', system: 'system' }

const SENDER_LABEL = { agent: 'ممثل خدمة العملاء', ai: 'المساعد الذكي' }

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
}

function formatBytes(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} بايت`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} كيلوبايت`

  return `${(bytes / (1024 * 1024)).toFixed(1)} ميجابايت`
}

/**
 * Older messages predate attachment_name, so their name still has to be
 * recovered from the URL - which is why the server now records it.
 */
function fileNameFromUrl(url) {
  try {
    const last = decodeURIComponent(url.split('/').pop())
    const underscoreIndex = last.indexOf('_')
    return underscoreIndex > -1 ? last.slice(underscoreIndex + 1) : last
  } catch {
    return 'ملف'
  }
}

function MessageContent({ text, messageType, fileName, fileSize, isTemplate, documentRequestId, onReturnFile }) {
  if (messageType === 'image') {
    return (
      <a href={text} target="_blank" rel="noreferrer">
        <img src={text} alt="مرفق" className="esamco-chat-attachment-image" />
      </a>
    )
  }

  if (messageType === 'file') {
    const name = fileName || fileNameFromUrl(text)

    return (
      <div className="esamco-chat-document">
        <a href={text} target="_blank" rel="noreferrer" className="esamco-chat-attachment-file">
          <DocumentIcon />
          <span className="esamco-chat-document-meta">
            <span className="esamco-chat-document-name">{name}</span>
            <span className="esamco-chat-document-sub">
              {isTemplate ? 'نموذج للتعبئة' : 'ملف'}
              {fileSize ? ` · ${formatBytes(fileSize)}` : ''}
            </span>
          </span>
        </a>

        {/* Without this the customer has to find the paperclip and hope the
            agent can tell which form they just answered. Replying on the
            form itself is both the obvious gesture and the unambiguous one.

            Shown only while the request is still open: document_request_id
            arrives null once the agent marked the document "للاطلاع فقط",
            and once a sent form has been returned or cancelled, so a form
            already answered stops asking to be answered again. */}
        {isTemplate && documentRequestId ? (
          <button
            type="button"
            className="esamco-chat-document-return"
            onClick={() => onReturnFile?.(documentRequestId)}
          >
            املأ النموذج وأعد إرساله بالضغط هنا
          </button>
        ) : null}
      </div>
    )
  }

  return <div className="esamco-chat-message-text">{text}</div>
}

export default function MessageBubble({
  from,
  text,
  at,
  status,
  messageType,
  fileName,
  fileSize,
  isTemplate,
  documentRequestId,
  onReturnFile,
}) {
  const label = SENDER_LABEL[from]

  return (
    <div className={`esamco-chat-message ${SENDER_CLASS[from] || 'ai'}`}>
      {label && <div className="esamco-chat-message-label">{label}</div>}
      <MessageContent
        text={text}
        messageType={messageType}
        fileName={fileName}
        fileSize={fileSize}
        isTemplate={isTemplate}
        documentRequestId={documentRequestId}
        onReturnFile={onReturnFile}
      />
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
