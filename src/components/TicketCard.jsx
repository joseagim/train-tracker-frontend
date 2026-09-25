import { useState } from 'react'
import { useLanguage } from '../context/language-context'
import { formatDate, formatPrice, formatTime, ticketTimes } from '../utils/format'
import Modal from './ui/Modal'
import QrCode from './ui/QrCode'
import TrainLogo from './TrainLogo'

function QrIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path strokeLinecap="round" d="M14 14h3v3h-3zM19 14v2M14 19h2M19 19h2" />
    </svg>
  )
}

export default function TicketCard({ ticket, showQr = true }) {
  const { language, t } = useLanguage()
  const { departure, arrival } = ticketTimes(ticket)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  return (
    <article className="flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="min-w-0 flex-1 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold text-slate-900">{formatTime(departure, language)}</span>
              <span className="text-slate-300">→</span>
              <span className="text-2xl font-semibold text-slate-900">{formatTime(arrival, language)}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {ticket.origin?.name} → {ticket.destination?.name}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {formatDate(departure, language)} · {ticket.trip?.train?.type ?? t('common.train')}
            </p>
          </div>

          <div className="flex shrink-0 gap-6 text-right">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('ticketCard.wagon')}</p>
              <p className="text-2xl font-semibold text-slate-900">{ticket.bogey}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('ticketCard.seat')}</p>
              <p className="text-2xl font-semibold text-slate-900">{ticket.seat}</p>
            </div>
          </div>
        </div>

        {ticket.trip?.status && ticket.trip.status !== 'ON_TIME' && (
          <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            {ticket.trip.status === 'DELAYED' ? t('ticketCard.delayed') : t('ticketCard.cancelled')}
          </span>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
          <span>
            {t('common.price')}{' '}
            <span className="font-semibold text-slate-900">{formatPrice(ticket.price, language)}</span>
          </span>
          <TrainLogo trainType={ticket.trip?.train?.type} className="text-right" />
        </div>
      </div>

      {showQr && (
        <div className="flex w-28 shrink-0 items-center justify-center border-l border-dashed border-slate-200 bg-brand-50 p-4 sm:w-32">
          <button
            type="button"
            onClick={() => setQrModalOpen(true)}
            className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-lg bg-white text-slate-500 shadow-sm transition hover:text-brand-700"
          >
            <QrIcon className="size-10" />
            <span className="text-xs font-semibold uppercase tracking-wide">{t('ticketCard.viewQr')}</span>
          </button>
        </div>
      )}

      {qrModalOpen && (
        <Modal title={t('ticketCard.qrModalTitle')} onClose={() => setQrModalOpen(false)}>
          <div className="mt-4 flex flex-col items-center gap-3">
            <QrCode value={ticket.uuid} size={220} className="rounded-lg" alt={t('ticketCard.qrAltText')} />
            <p className="text-center text-sm text-slate-500">{t('ticketCard.showToInspector')}</p>
          </div>
        </Modal>
      )}
    </article>
  )
}
