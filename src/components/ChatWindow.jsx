import { useSelector } from 'react-redux'
import AiChatView from './AiChatView.jsx'
import LeadForm from './LeadForm.jsx'
import LiveChatView from './LiveChatView.jsx'
import logoUrl from '../assets/logo.webp'

export default function ChatWindow() {
  const view = useSelector((s) => s.chat.view)

  if (view === 'closed') return null

  return (
    <div className="esamco-chat-window">
      <div className="esamco-chat-header">
        <div className="esamco-chat-header-avatar">
          <img src={logoUrl} alt="Esamco" />
        </div>
        <div className="esamco-chat-header-text">
          <div className="esamco-chat-header-title">
            <span className="esamco-chat-header-brand-en">ESAMCO</span>
            <span className="esamco-chat-header-brand-ar">مجموعة عصامكو</span>
          </div>
          <div className="esamco-chat-header-subtitle">
            <span className="esamco-chat-online-dot" />
            مساعد ذكي · متصل الآن
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
