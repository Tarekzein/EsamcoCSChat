import { useSelector } from 'react-redux'
import AiChatView from './AiChatView.jsx'
import LeadForm from './LeadForm.jsx'
import LiveChatView from './LiveChatView.jsx'
import { SupportIcon } from '../icons.jsx'

export default function ChatWindow() {
  const view = useSelector((s) => s.chat.view)

  if (view === 'closed') return null

  return (
    <div className="esamco-chat-window">
      <div className="esamco-chat-header">
        <div className="esamco-chat-header-avatar">
          <SupportIcon />
        </div>
        <div className="esamco-chat-header-text">
          <div className="esamco-chat-header-title">مساعد Esamco</div>
          <div className="esamco-chat-header-subtitle">
            <span className="esamco-chat-online-dot" />
            متصل الآن
          </div>
        </div>
      </div>

      <div className="esamco-chat-body">
        {view === 'lead_form' ? (
          <LeadForm />
        ) : view === 'live_chat' ? (
          <LiveChatView />
        ) : (
          <AiChatView />
        )}
      </div>
    </div>
  )
}
