export function inputClasses({ invalid = false, className = '' } = {}) {
  return [
    'h-10 w-full rounded-lg border bg-white px-3 text-sm outline-none transition',
    invalid
      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100'
      : 'border-slate-300 focus:border-brand-600 focus:ring-2 focus:ring-brand-100',
    className,
  ].join(' ')
}

// `error` puede ser un string (mensaje a mostrar) o `true` (solo marcar el
// campo como inválido, sin texto — p. ej. cuando ya lo indican el asterisco
// y el borde rojo, como en un campo obligatorio vacío).
// `className` posiciona el campo completo (label + input) dentro de su
// contenedor — para el propio `<input>` usa `inputClasses()` directamente.
export default function Input({ id, label, required, hint, error, className = '', ...props }) {
  const errorMessage = typeof error === 'string' ? error : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errorMessage ? `${id}-error` : undefined

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        className={inputClasses({ invalid: !!error })}
        {...props}
      />
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
