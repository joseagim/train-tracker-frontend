import jsQR from 'jsqr'
import { useCallback, useEffect, useRef, useState } from 'react'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import TicketCard from '../components/TicketCard'
import Button from '../components/ui/Button'
import { useLanguage } from '../context/language-context'
import useDocumentTitle from '../hooks/useDocumentTitle'
import * as api from '../services/api'

function QrIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path strokeLinecap="round" d="M14 14h3v3h-3zM19 14v2M14 19h2M19 19h2" />
    </svg>
  )
}

export default function ValidateQrPage() {
  const { t } = useLanguage()
  useDocumentTitle(t('validateQr.docTitle'))

  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanningAction, setScanningAction] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const handleDecoded = useCallback(async (uuid) => {
    setError('')
    setLoading(true)
    try {
      const data = await api.validateTicket(uuid)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!scanning) return undefined

    let stream = null
    let rafId = null
    let stopped = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        tick()
      } catch {
        setError(t('validateQr.cameraError'))
        setScanning(false)
      }
    }

    function tick() {
      if (stopped) return
      const video = videoRef.current
      const canvas = canvasRef.current
      if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(frame.data, frame.width, frame.height)
        if (code?.data) {
          stopped = true
          stream?.getTracks().forEach((track) => track.stop())
          setScanning(false)
          handleDecoded(code.data)
          return
        }
      }
      rafId = requestAnimationFrame(tick)
    }

    start()

    return () => {
      stopped = true
      if (rafId) cancelAnimationFrame(rafId)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [scanning, handleDecoded, t])

  async function handleScan() {
    if (!result?.ticket?.uuid) return
    setScanningAction(true)
    setError('')
    try {
      const data = await api.scanTicket(result.ticket.uuid)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setScanningAction(false)
    }
  }

  function handleReset() {
    setResult(null)
    setError('')
    setScanning(true)
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('validateQr.heading')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('validateQr.subtitle')}</p>
      </div>

      {error && <Alert>{error}</Alert>}

      {scanning && (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
            <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
          </div>
          <Button type="button" variant="outline-danger" className="w-full" onClick={() => setScanning(false)}>
            {t('validateQr.cancel')}
          </Button>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {loading && <Spinner label={t('validateQr.checking')} />}

      {!scanning && !result && !loading && (
        <button
          type="button"
          onClick={() => setScanning(true)}
          className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-white py-10 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
        >
          <QrIcon className="size-10" />
          <span className="text-sm font-semibold">{t('validateQr.scanTicket')}</span>
        </button>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="min-w-0">
              <p className="overflow-x-auto whitespace-nowrap text-lg font-semibold text-slate-900">
                {result.firstName} {result.lastName}
              </p>
              <p className="mt-0.5 overflow-x-auto whitespace-nowrap text-sm text-slate-500">
                {t('validateQr.dni', { value: result.dni })}
              </p>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold ${
                result.scanned ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}
            >
              {result.scanned ? (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l4 4 8-8" />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
                  <circle cx="10" cy="10" r="7" />
                  <path strokeLinecap="round" d="M10 6v4l3 2" />
                </svg>
              )}
              {result.scanned ? t('validateQr.scanned') : t('validateQr.pending')}
            </span>
          </div>

          <TicketCard ticket={result.ticket} showQr={false} />

          <div className="flex flex-wrap gap-3">
            {!result.scanned && (
              <Button type="button" className="flex-1" onClick={handleScan} disabled={scanningAction}>
                {scanningAction ? t('validateQr.scanning') : t('validateQr.markScanned')}
              </Button>
            )}
            <Button type="button" variant="outline-brand" className="flex-1" onClick={handleReset}>
              {t('validateQr.scanAnother')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
