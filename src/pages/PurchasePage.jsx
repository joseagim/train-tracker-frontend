import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Alert from '../components/Alert'
import TicketCard from '../components/TicketCard'
import * as api from '../services/api'
import { countFreeSeats, formatDate, formatTime, findStop } from '../utils/format'

export default function PurchasePage() {
  const location = useLocation()
  const { trip, origin, destination, date, passengers = 1 } = location.state ?? {}

  const [tickets, setTickets] = useState([])
  const [error, setError] = useState('')
  const [buying, setBuying] = useState(false)

  // Se llega aquí desde el buscador; sin datos de viaje no hay nada que comprar.
  if (!trip || !origin || !destination) {
    return <Navigate to="/" replace />
  }

  const departure = findStop(trip, origin.name)?.estimatedTime ?? trip.departureTime
  const arrival = findStop(trip, destination.name)?.estimatedTime
  const freeSeats = countFreeSeats(trip.seats)
  const done = tickets.length >= passengers

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
          ← Volver al buscador
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">
          {tickets.length ? 'Compra realizada' : 'Confirmar compra'}
        </h1>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-medium uppercase tracking-wide text-slate-400">Resumen</h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-500">Trayecto</dt>
            <dd className="text-sm font-medium text-slate-900">
              {origin.name} → {destination.name}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Tren</dt>
            <dd className="text-sm font-medium text-slate-900">{trip.train?.type ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Salida</dt>
            <dd className="text-sm font-medium text-slate-900">
              {formatDate(date ?? departure)} · {formatTime(departure)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Llegada estimada</dt>
            <dd className="text-sm font-medium text-slate-900">{formatTime(arrival)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Pasajeros</dt>
            <dd className="text-sm font-medium text-slate-900">{passengers}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Asientos libres</dt>
            <dd className="text-sm font-medium text-slate-900">{freeSeats}</dd>
          </div>
        </dl>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}

        {!done && (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={buying}
            className="mt-5 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {buying
              ? 'Procesando…'
              : tickets.length
                ? `Reintentar (faltan ${passengers - tickets.length})`
                : `Confirmar compra${passengers > 1 ? ` (${passengers} billetes)` : ''}`}
          </button>
        )}
      </section>

      {tickets.length > 0 && (
        <section className="space-y-4">
          <Alert type="success">
            {tickets.length === 1
              ? 'Billete emitido correctamente.'
              : `${tickets.length} billetes emitidos correctamente.`}
          </Alert>

          {tickets.map((ticket) => (
            <TicketCard key={ticket.uuid} ticket={ticket} />
          ))}

          <Link
            to="/my-tickets"
            className="inline-block rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Ver mis billetes
          </Link>
        </section>
      )}
    </div>
  )
}
