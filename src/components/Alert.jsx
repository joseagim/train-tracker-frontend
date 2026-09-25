import { forwardRef } from 'react'

const STYLES = {
  error: 'border-red-200 bg-red-50 text-red-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
}

const Alert = forwardRef(function Alert({ type = 'error', id, children }, ref) {
  if (!children) return null
  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      role={type === 'error' ? 'alert' : 'status'}
      className={`rounded-lg border px-4 py-3 text-sm ${STYLES[type]}`}
    >
      {children}
    </div>
  )
})

export default Alert
