import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../context/language-context'

function SpainFlag({ className = '' }) {
  return (
    <span className={`block overflow-hidden rounded-full ${className}`}>
      <svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true">
        <rect width="3" height="2" fill="#AA151B" />
        <rect y="0.5" width="3" height="1" fill="#F1BF00" />
      </svg>
    </span>
  )
}

function UKFlag({ className = '' }) {
  return (
    <span className={`block overflow-hidden rounded-full ${className}`}>
      <svg viewBox="0 0 60 40" preserveAspectRatio="xMidYMid slice" className="block h-full w-full" aria-hidden="true">
        <rect width="60" height="40" fill="#00247D" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0 0 60 40M60 0 0 40" stroke="#CF142B" strokeWidth="3.2" />
        <path d="M30 0V40M0 20H60" stroke="#FFFFFF" strokeWidth="13.4" />
        <path d="M30 0V40M0 20H60" stroke="#CF142B" strokeWidth="8" />
      </svg>
    </span>
  )
}

const LANGUAGES = [
  { code: 'es', name: 'Español', Flag: SpainFlag },
  { code: 'en', name: 'English', Flag: UKFlag },
]

function ChevronDownIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 12 7" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M1 1l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M4 10l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false)
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0]

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('nav.changeLanguage')}
        title={t('nav.changeLanguage')}
        className="flex items-center gap-1.5 rounded-full p-1 transition hover:bg-slate-100"
      >
        <current.Flag className="size-6 shrink-0 ring-1 ring-slate-200" />
        <ChevronDownIcon className="size-2.5 text-slate-500" />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('nav.changeLanguage')}
          className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {LANGUAGES.map((lang) => {
            const selected = lang.code === language
            return (
              <li key={lang.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setLanguage(lang.code)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                    selected ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <lang.Flag className="size-5 shrink-0 ring-1 ring-slate-200" />
                  <span className="flex-1 font-medium">{lang.name}</span>
                  {selected && <CheckIcon className="size-4 shrink-0 text-brand-700" />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
