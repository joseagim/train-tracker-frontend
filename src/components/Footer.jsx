import { SOCIAL_LINKS as SOCIAL_URLS } from '../config/socialLinks'
import { useLanguage } from '../context/language-context'

// Iconos de marca a color único (currentColor), sin depender de una
// librería de iconos — mismo criterio que el resto de iconos hechos a mano
// en la app (ver SwapIcon, EyeIcon...).
function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48 0-.24-.01-1.02-.01-1.85-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.07.63-1.32-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.68.92.68 1.85 0 1.34-.01 2.41-.01 2.74 0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z" />
    </svg>
  )
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  )
}

function PortfolioIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <rect x="2.5" y="6.5" width="15" height="10" rx="1.5" />
      <path d="M7 6.5V5A1.5 1.5 0 0 1 8.5 3.5h3A1.5 1.5 0 0 1 13 5v1.5" strokeLinecap="round" />
      <path d="M2.5 10.75h15" />
    </svg>
  )
}

// Las URLs viven en `src/config/socialLinks.js`: mientras un campo esté
// vacío, el icono se muestra como informativo (sin enlace).
const SOCIAL_LINKS = [
  { label: 'GitHub', Icon: GitHubIcon, url: SOCIAL_URLS.github },
  { label: 'LinkedIn', Icon: LinkedInIcon, url: SOCIAL_URLS.linkedin },
  { label: 'Portfolio', Icon: PortfolioIcon, url: SOCIAL_URLS.portfolio },
]

export default function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-center gap-3 px-4 pb-3 pt-5 sm:flex-row sm:gap-5">
        <p className="text-sm text-slate-500">TrainTracker — {t('footer.tagline')}</p>
        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map(({ label, Icon, url }) => {
            const className =
              'flex size-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
            const content = (
              <>
                <Icon className="size-4" />
                <span className="sr-only">{label}</span>
              </>
            )
            return url ? (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" title={label} className={className}>
                {content}
              </a>
            ) : (
              <span key={label} title={label} className={className}>
                {content}
              </span>
            )
          })}
        </div>
      </div>
      <p className="mx-auto max-w-5xl px-4 pb-5 text-center text-xs text-slate-400">{t('footer.disclaimer')}</p>
    </footer>
  )
}
