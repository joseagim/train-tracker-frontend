import { useEffect, useId, useRef } from 'react'

export default function Modal({ title, onClose, children }) {
  const panelRef = useRef(null)
  const titleId = useId()

  useEffect(() => {
    panelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl outline-none"
      >
        <div className="flex items-center justify-between gap-4">
          {title && (
            <h2 id={titleId} className="text-sm font-semibold text-slate-900">
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="ml-auto rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
              <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
