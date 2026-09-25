import { inputClasses } from './Input'

export default function Select({ id, label, required, hint, error, className = '', children, ...props }) {
  const errorMessage = typeof error === 'string' ? error : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errorMessage ? `${id}-error` : undefined

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={inputClasses({ invalid: !!error })}
        {...props}
      >
        {children}
      </select>
      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
      {errorMessage && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
