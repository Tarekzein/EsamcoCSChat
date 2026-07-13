export function ChatIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="26" height="26" {...props}>
      <path
        d="M4 12c0-4.42 3.58-8 8-8s8 3.58 8 8-3.58 8-8 8c-1.04 0-2.03-.2-2.94-.55L5 20l1.1-3.66A7.96 7.96 0 0 1 4 12Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function CloseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SendIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M21 3 3 10.5l6.5 2.5M21 3l-8 18-2.5-8.5M21 3 9.5 13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SingleCheckIcon(props) {
  return (
    <svg viewBox="0 0 16 16" fill="none" width="14" height="14" {...props}>
      <path d="M2 8.5 5.5 12 14 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function DoubleCheckIcon(props) {
  return (
    <svg viewBox="0 0 20 16" fill="none" width="17" height="14" {...props}>
      <path d="M1 8.5 4.5 12 13 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 8.5 10 12 18.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PaperclipIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" {...props}>
      <path
        d="M8 12.5V8a4 4 0 0 1 8 0v8a2.5 2.5 0 0 1-5 0V9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function DocumentIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" {...props}>
      <path
        d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

export function SupportIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" width="20" height="20" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}
