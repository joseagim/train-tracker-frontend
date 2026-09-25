import { useState } from 'react'
import { useLanguage } from '../../context/language-context'
import { inputClasses } from './Input'

function EyeIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
      />
      <circle cx="10" cy="10" r="2.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EyeOffIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.5 2.5l15 15M8.28 8.34a2.25 2.25 0 0 0 3.18 3.2M6.06 6.18C3.6 7.6 1.5 10 1.5 10S4.5 16 10 16c1.5 0 2.8-.44 3.9-1.05M16.14 13.68C17.63 12.32 18.5 10 18.5 10S15.5 4 10 4c-.59 0-1.15.06-1.68.18"
      />
    </svg>
  )
}

export default function PasswordInput({ id, label, required, hint, error, className = '', ...props }) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const errorMessage = typeof error === 'string' ? error : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errorMessage ? `${id}-error` : undefined

  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
          className={inputClasses({ invalid: !!error, className: 'pr-10' })}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-controls={id}
          aria-label={visible ? t('login.hidePassword') : t('login.showPassword')}
          title={visible ? t('login.hidePassword') : t('login.showPassword')}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-brand-700"
        >
          {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
        </button>
      </div>
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
