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
    <button type="button" className="esamco-chat-bubble" onClick={toggle} aria-label="فتح المحادثة">
      {isOpen ? <CloseIcon /> : <ChatIcon />}
      {!isOpen && unreadCount > 0 && <span className="esamco-chat-badge">{unreadCount}</span>}
    </button>
  )
}
