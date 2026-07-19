import { useDispatch, useSelector } from 'react-redux'
import { openWidget, setView } from '../chatSlice.js'
import { ChatIcon, CloseIcon } from '../icons.jsx'

export default function Bubble() {
  const dispatch = useDispatch()
  const view = useSelector((s) => s.chat.view)
  const unreadCount = useSelector((s) => s.chat.unreadCount)
  const isOpen = view !== 'closed'

  const toggle = () => {
    if (isOpen) {
      dispatch(setView('closed'))
    } else {
      dispatch(openWidget())
    }
  }

  return (
    <button
      type="button"
      className={`esamco-chat-bubble ${!isOpen && unreadCount > 0 ? 'esamco-chat-bubble--attention' : ''}`}
      onClick={toggle}
      aria-label="فتح المحادثة"
    >
      {/* key forces a remount on toggle, which re-triggers the CSS
          entrance animation below - a quick, cheap cross-fade/pop between
          the two icons without needing both mounted at once. */}
      <span className="esamco-chat-bubble-icon" key={isOpen ? 'close' : 'chat'}>
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </span>
      {!isOpen && unreadCount > 0 && <span className="esamco-chat-badge">{unreadCount}</span>}
    </button>
  )
}
