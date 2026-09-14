import { useState } from 'react'
import { countFreeSeats, formatDuration, formatTime, findStop } from '../utils/format'

export default function TripCard({ trip, origin, destination, passengers, onBuy }) {
  const [showStops, setShowStops] = useState(false)

  const originStop = findStop(trip, origin.name)
  const destinationStop = findStop(trip, destination.name)

  const departure = originStop?.estimatedTime ?? trip.departureTime
  const arrival = destinationStop?.estimatedTime

  const freeSeats = countFreeSeats(trip.seats)
  const enoughSeats = freeSeats >= passengers

  // Paradas comprendidas entre el origen y el destino elegidos.
  const stops = trip.stations ?? []
  const fromIdx = stops.findIndex((s) => s.name === origin.name)
  const toIdx = stops.findIndex((s) => s.name === destination.name)
  const legStops = fromIdx !== -1 && toIdx > fromIdx ? stops.slice(fromIdx, toIdx + 1) : stops
  const intermediate = legStops.slice(1, -1)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {trip.train?.type ?? 'Tren'} · Viaje #{trip.id}
          </p>

          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-slate-900">{formatTime(departure)}</span>
            <span className="text-slate-300">→</span>
            <span className="text-2xl font-semibold text-slate-900">{formatTime(arrival)}</span>
            {formatDuration(departure, arrival) && (
              <span className="text-sm text-slate-500">{formatDuration(departure, arrival)}</span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-600">
            {origin.name} → {destination.name}
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {intermediate.length === 0
              ? 'Sin paradas intermedias'
              : `${intermediate.length} parada${intermediate.length > 1 ? 's' : ''}: ${intermediate
                  .map((s) => s.name)
                  .join(', ')}`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              enoughSeats ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {freeSeats} asientos libres
          </span>
          <span className="text-xs text-slate-400">Precio al confirmar</span>
          <button
            type="button"
            onClick={() => onBuy(trip)}
            disabled={!enoughSeats}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Comprar
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowStops((v) => !v)}
        className="mt-4 text-sm font-medium text-slate-600 underline-offset-2 hover:underline"
      >
        {showStops ? 'Ocultar recorrido' : 'Ver recorrido completo'}
      </button>

      {showStops && (
        <ol className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {stops.map((stop) => {
            const isEdge = stop.name === origin.name || stop.name === destination.name
            return (
              <li key={`${stop.name}-${stop.estimatedTime}`} className="flex items-center gap-3 text-sm">
                <span
                  className={`size-2 rounded-full ${isEdge ? 'bg-slate-900' : 'bg-slate-300'}`}
                  aria-hidden
                />
                <span className="w-14 tabular-nums text-slate-500">
                  {formatTime(stop.estimatedTime)}
                </span>
                <span className={isEdge ? 'font-medium text-slate-900' : 'text-slate-600'}>
                  {stop.name}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </article>
  )
}
