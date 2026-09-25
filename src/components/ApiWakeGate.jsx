import { useEffect, useState } from 'react'
import { useLanguage } from '../context/language-context'
import * as api from '../services/api'

// La API está en un plan gratuito que se apaga tras un rato de inactividad:
// la primera petición tras el "sueño" puede tardar hasta un minuto en
// responder (o llegar como 502 mientras arranca). En vez de dejar que cada
// página se estrelle contra ese primer fallo, comprobamos aquí, antes de
// montar el resto de la app, si el servidor responde.
const INITIAL_TIMEOUT_MS = 6000
const RETRY_INTERVAL_MS = 5000

function TrainPulseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <rect x="5" y="4" width="14" height="12" rx="4" />
      <path d="M9 16.5 7 20M15 16.5l2 3.5" strokeLinecap="round" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function WakingScreen({ elapsed }) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-brand-100 bg-brand-50/50 px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <TrainPulseIcon className="size-7 animate-pulse motion-reduce:animate-none" />
      </span>
      <div className="max-w-md space-y-1">
        <p className="text-lg font-semibold text-slate-900">{t('apiWake.title')}</p>
        <p className="text-sm text-slate-500">{t('apiWake.message')}</p>
      </div>
      <p role="status" aria-live="polite" className="text-xs text-slate-400">
        {t('apiWake.elapsed', { seconds: elapsed })}
      </p>
    </div>
  )
}

export default function ApiWakeGate({ children }) {
  const { t } = useLanguage()
  const [status, setStatus] = useState('checking') // 'checking' | 'waking' | 'ready'
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    let cancelled = false
    let retryTimer = null
    let wasWaking = false

    async function attempt(timeoutMs) {
      try {
        await api.ping(timeoutMs)
        if (cancelled) return
        if (wasWaking) {
          // El servidor ya estaba "dormido" cuando el usuario llegó: recargamos
          // para que toda la app arranque limpia contra un backend ya despierto.
          window.location.reload()
          return
        }
        setStatus('ready')
      } catch {
        if (cancelled) return
        wasWaking = true
        setStatus('waking')
        retryTimer = setTimeout(() => attempt(RETRY_INTERVAL_MS), RETRY_INTERVAL_MS)
      }
    }

    attempt(INITIAL_TIMEOUT_MS)

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
  }, [])

  useEffect(() => {
    if (status !== 'waking') return undefined
    const start = Date.now()
    const tick = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(tick)
  }, [status])

  if (status === 'ready') return children

  if (status === 'waking') return <WakingScreen elapsed={elapsed} />

  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 motion-reduce:animate-none"
      />
      {t('common.loading')}
    </div>
  )
}
