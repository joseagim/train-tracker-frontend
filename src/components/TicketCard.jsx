import { formatDate, formatPrice, formatTime, ticketTimes } from '../utils/format'

export default function TicketCard({ ticket }) {
  const { departure, arrival } = ticketTimes(ticket)

  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3">
        <span className="text-sm font-medium text-slate-700">
          {ticket.trip?.train?.type ?? 'Tren'} · {formatDate(departure)}
        </span>
        <span className="font-mono text-xs text-slate-400">{ticket.uuid}</span>
      </div>

      <div className="grid gap-5 px-5 py-4 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="text-xl font-semibold text-slate-900">{formatTime(departure)}</span>
            <span className="text-slate-300">→</span>
            <span className="text-xl font-semibold text-slate-900">{formatTime(arrival)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {ticket.origin?.name} → {ticket.destination?.name}
          </p>
          {ticket.trip?.status && ticket.trip.status !== 'ON_TIME' && (
            <span className="mt-2 inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
              {ticket.trip.status === 'DELAYED' ? 'Retrasado' : 'Cancelado'}
            </span>
          )}
        </div>

        <dl className="flex gap-6 sm:justify-end">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Vagón</dt>
            <dd className="text-lg font-semibold text-slate-900">{ticket.bogey}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Asiento</dt>
            <dd className="text-lg font-semibold text-slate-900">{ticket.seat}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Precio</dt>
            <dd className="text-lg font-semibold text-slate-900">{formatPrice(ticket.price)}</dd>
          </div>
        </dl>
      </div>
    </article>
  )
}
