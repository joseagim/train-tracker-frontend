import { useId, useState } from 'react'
import { useLanguage } from '../context/language-context'
import TrainLogo from './TrainLogo'
import { countFreeSeats, formatDuration, formatPrice, formatTime, findStop } from '../utils/format'

export default function TripCard({ trip, origin, destination, passengers, onBuy }) {
  const { language, t } = useLanguage()
  const [showStops, setShowStops] = useState(false)
  const stopsId = useId()

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
      <div className="flex flex-wrap items-center gap-5">
        <div className="flex min-w-[150px] flex-col gap-0.5">
          <TrainLogo trainType={trip.train?.type} />
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {trip.train?.type ?? t('common.train')}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-slate-900">{formatTime(departure, language)}</span>
            <span className="text-slate-300">→</span>
            <span className="text-2xl font-semibold text-slate-900">{formatTime(arrival, language)}</span>
          </div>
          {formatDuration(departure, arrival) && (
            <span className="text-xs text-slate-500">{formatDuration(departure, arrival)}</span>
          )}
        </div>

        <div className="hidden w-px self-stretch bg-slate-100 sm:block" aria-hidden="true" />

        <div className="min-w-[200px] flex-1">
          <p className="text-sm text-slate-600">
            {origin.name} → {destination.name}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {intermediate.length === 0
              ? t('tripCard.noStops')
              : t('tripCard.stops', { count: intermediate.length, list: intermediate.map((s) => s.name).join(', ') })}
          </p>
        </div>

        <div className="hidden w-px self-stretch bg-slate-100 sm:block" aria-hidden="true" />

        <div className="ml-auto flex flex-col items-end gap-2">
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
              enoughSeats ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {t('tripCard.freeSeats', { count: freeSeats })}
          </span>
          <button
            type="button"
            onClick={() => onBuy(trip)}
            disabled={!enoughSeats}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
          >
            {t('tripCard.buy')}
          </button>
          <span className="text-2xl font-semibold text-slate-900">{formatPrice(trip.price, language)}</span>
        </div>

        <button
          type="button"
          onClick={() => setShowStops((v) => !v)}
          aria-expanded={showStops}
          aria-controls={stopsId}
          className="basis-full border-t border-slate-100 pt-3 text-left text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
        >
          {showStops ? t('tripCard.hideStops') : t('tripCard.showStops')}
        </button>
      </div>

      {showStops && (
        <ol id={stopsId} className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          {stops.map((stop) => {
            const isEdge = stop.name === origin.name || stop.name === destination.name
            return (
              <li key={`${stop.name}-${stop.estimatedTime}`} className="flex items-center gap-3 text-sm">
                <span
                  className={`size-2 rounded-full ${isEdge ? 'bg-slate-900' : 'bg-slate-300'}`}
                  aria-hidden
                />
                <span className="w-14 tabular-nums text-slate-500">
                  {formatTime(stop.estimatedTime, language)}
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
