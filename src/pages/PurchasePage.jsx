import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Alert from '../components/Alert'
import TicketCard from '../components/TicketCard'
import { useLanguage } from '../context/language-context'
import useDocumentTitle from '../hooks/useDocumentTitle'
import * as api from '../services/api'
import { countFreeSeats, formatDate, formatPrice, formatTime, findStop } from '../utils/format'

export default function PurchasePage() {
  const location = useLocation()
  const { trip, origin, destination, date, passengers = 1 } = location.state ?? {}
  const { language, t } = useLanguage()

  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)
  const errorRef = useRef(null)

  useDocumentTitle(tickets.length ? t('purchase.docTitleDone') : t('purchase.docTitlePending'))

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])

  // Se llega aquí desde el buscador; sin datos de viaje no hay nada que comprar.
  if (!trip || !origin || !destination) {
    return <Navigate to="/" replace />
  }

  const departure = findStop(trip, origin.name)?.estimatedTime ?? trip.departureTime
  const arrival = findStop(trip, destination.name)?.estimatedTime
  const freeSeats = countFreeSeats(trip.seats)
  const done = tickets.length >= passengers
  const totalPrice = typeof trip.price === 'number' ? trip.price * passengers : trip.price

  async function handleConfirm() {
    setError('')
    setBuying(true)
    const bought = []
    try {
      // La API emite un billete por petición: compramos uno por pasajero.
      for (let i = 0; i < passengers; i++) {
        const ticket = await api.purchaseTicket({
          tripId: trip.id,
          origin: origin.id,
          destination: destination.id,
        })
        bought.push(ticket)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      if (bought.length) setTickets((prev) => [...prev, ...bought])
      setBuying(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link to="/" className="text-sm text-slate-500 underline-offset-2 hover:underline">
          {t('purchase.back')}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {tickets.length ? t('purchase.headingDone') : t('purchase.headingPending')}
        </h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">
              {origin.name} → {destination.name}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {formatDate(date ?? departure, language)} · {formatTime(departure, language)} →{' '}
              {formatTime(arrival, language)}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-semibold text-slate-900">{formatPrice(totalPrice, language)}</p>
            {passengers > 1 && (
              <p className="text-xs text-slate-400">
                {t('purchase.perTicket', { price: formatPrice(trip.price, language) })}
              </p>
            )}
          </div>
        </div>

        <dl className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{t('purchase.train')}</dt>
            <dd className="font-medium text-slate-900">{trip.train?.type ?? '—'}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{t('purchase.passengers')}</dt>
            <dd className="font-medium text-slate-900">{passengers}</dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-slate-500">{t('purchase.freeSeats')}</dt>
            <dd className="font-medium text-slate-900">{freeSeats}</dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4">
            <Alert ref={errorRef} id="purchase-error">
              {error}
            </Alert>
          </div>
        )}

        {!done && (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={buying}
            aria-describedby={error ? 'purchase-error' : undefined}
            className="mt-5 w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {buying
              ? t('purchase.processing')
              : tickets.length
                ? t('purchase.retry', { count: passengers - tickets.length })
                : t('purchase.confirm', { count: passengers })}
          </button>
        )}
      </section>

      {tickets.length > 0 && (
        <section className="space-y-4">
          <Alert type="success">{t('purchase.issued', { count: tickets.length })}</Alert>

          {tickets.map((ticket) => (
            <TicketCard key={ticket.uuid} ticket={ticket} />
          ))}

          <Link
            to="/my-tickets"
            className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            {t('purchase.viewMyTickets')}
          </Link>
        </section>
      )}
    </div>
  )
}
