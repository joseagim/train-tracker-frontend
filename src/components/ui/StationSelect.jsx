// Select nativo (accesible, con su <label>) con una capa visual encima que
// muestra el valor truncado con "…" cuando el nombre de la estación no cabe.
export default function StationSelect({
  id,
  label,
  required,
  error,
  displayValue,
  placeholder,
  disabled,
  className = '',
  children,
  ...props
}) {
  const errorMessage = typeof error === 'string' ? error : undefined
  const errorId = errorMessage ? `${id}-error` : undefined
  const shown = displayValue || placeholder

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div
        className={`relative flex h-10 items-center rounded-lg border bg-white pl-3 pr-8 transition ${
          disabled ? 'bg-slate-50' : ''
        } ${
          error
            ? 'border-red-300 focus-within:border-red-500 focus-within:ring-2 focus-within:ring-red-100'
            : 'border-slate-300 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100'
        }`}
      >
        <span
          className={`truncate text-sm ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}
          title={displayValue || undefined}
          aria-hidden="true"
        >
          {shown}
        </span>
        <svg
          className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          aria-hidden="true"
        >
          <path d="M5 7.5 10 12.5 15 7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        >
          {children}
        </select>
      </div>
      {errorMessage && (
        <p id={errorId} className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
