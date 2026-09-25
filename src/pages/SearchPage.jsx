import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import TripCard from '../components/TripCard'
import Input from '../components/ui/Input'
import StationSelect from '../components/ui/StationSelect'
import Stepper from '../components/ui/Stepper'
import { useLanguage } from '../context/language-context'
import useDocumentTitle from '../hooks/useDocumentTitle'
import * as api from '../services/api'
import { findStop, formatDate, todayISODate } from '../utils/format'

const RECENT_SEARCHES_KEY = 'tt_recent_searches'
const MAX_RECENT_SEARCHES = 4

function loadRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveRecentSearches(list) {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list))
  } catch {
    // localStorage no disponible: el historial es opcional.
  }
}

function sameSearch(a, b) {
  return a.fromId === b.fromId && a.toId === b.toId && a.date === b.date && a.passengers === b.passengers
}

function stationLabel(station) {
  return station ? `${station.name} (${station.city})` : ''
}

function HistoryIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" {...props}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 5.5v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// El layout móvil duplica los campos con id "-m" (mismo campo, otra fila
// visual) — esta función los reconduce al mismo nombre lógico.
function fieldKey(domId) {
  return domId.replace(/-m$/, '')
}

function SortIcon({ className = 'size-3.5' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M10 15V5M6 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SwapIcon({ vertical, className = 'size-4' }) {
  return vertical ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path
        d="M7 2.5v11.5M3.5 11 7 14.5 10.5 11M13 17.5V6M9.5 9 13 5.5 16.5 9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden="true">
      <path
        d="M2.5 7h11.5M11 3.5 14.5 7 11 10.5M17.5 13H6M9 9.5 5.5 13 9 16.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function SearchPage() {
  const { language, t } = useLanguage()
  useDocumentTitle(t('search.docTitle'))

  const [stations, setStations] = useState([])
  const [stationsError, setStationsError] = useState('')
  const [loadingStations, setLoadingStations] = useState(true)

  const [form, setForm] = useState({ from: '', to: '', date: todayISODate(), passengers: 1 })
  const [results, setResults] = useState(null)
  const [criteria, setCriteria] = useState(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [swapSpins, setSwapSpins] = useState(0)
  const [recentSearches, setRecentSearches] = useState(() => loadRecentSearches())
  const [sortBy, setSortBy] = useState('time')
  const [sortDir, setSortDir] = useState('asc')

  const navigate = useNavigate()
  const errorRef = useRef(null)
  const skipAlertFocusRef = useRef(false)

  useEffect(() => {
    if (!error) return
    if (skipAlertFocusRef.current) {
      skipAlertFocusRef.current = false
      return
    }
    errorRef.current?.focus()
  }, [error])

  // Un segundo clic en el mismo criterio invierte el orden; cambiar de
  // criterio siempre arranca en ascendente.
  function handleSort(field) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  function handleSwap() {
    setForm((f) => ({ ...f, from: f.to, to: f.from }))
    // Cada clic gira 180° más (nunca hacia atrás): con dos flechas simétricas
    // basta un único giro para transmitir el intercambio.
    setSwapSpins((n) => n + 1)
  }

  // Rellena el formulario con una búsqueda anterior; el usuario decide si
  // cambiar algo (fecha, pasajeros...) antes de volver a pulsar Buscar.
  function applyRecentSearch(entry) {
    setForm({ from: entry.fromId, to: entry.toId, date: entry.date, passengers: entry.passengers })
    setError('')
    setFieldErrors({})
  }

  function clearFieldError(key) {
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  // Sustituye la burbuja de validación nativa del navegador: marca en rojo
  // los campos obligatorios vacíos (sin texto propio, para no desalinear la
  // fila) y muestra un único aviso debajo del formulario, como en el login.
  function validateForm(formEl) {
    if (formEl.checkValidity()) return true
    const invalidEls = [...formEl.querySelectorAll(':invalid')]
    const errors = {}
    invalidEls.forEach((el) => {
      errors[fieldKey(el.id)] = true
    })
    setFieldErrors(errors)
    skipAlertFocusRef.current = true
    setError(t('common.requiredFields'))
    invalidEls[0]?.focus()
    return false
  }

  useEffect(() => {
    let active = true
    api
      .getStations()
      .then((list) => {
        if (active) setStations(list)
      })
      .catch((err) => {
        if (active) setStationsError(err.message)
      })
      .finally(() => {
        if (active) setLoadingStations(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSearch(event) {
    event.preventDefault()
    setError('')
    if (!validateForm(event.currentTarget)) return
    setFieldErrors({})

    if (form.from === form.to) {
      setError(t('search.differentStations'))
      return
    }

    const origin = stations.find((s) => String(s.id) === String(form.from))
    const destination = stations.find((s) => String(s.id) === String(form.to))

    setSearching(true)
    setResults(null)
    setSortBy('time')
    setSortDir('asc')
    try {
      const trips = await api.searchTrips({
        from: form.from,
        to: form.to,
        date: form.date,
        passengers: form.passengers,
      })
      const nextCriteria = { origin, destination, date: form.date, passengers: Number(form.passengers) }
      setResults(trips)
      setCriteria(nextCriteria)

      const entry = {
        fromId: form.from,
        toId: form.to,
        fromLabel: stationLabel(origin),
        toLabel: stationLabel(destination),
        date: form.date,
        passengers: Number(form.passengers),
      }
      setRecentSearches((prev) => {
        const next = [entry, ...prev.filter((s) => !sameSearch(s, entry))].slice(0, MAX_RECENT_SEARCHES)
        saveRecentSearches(next)
        return next
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  function handleBuy(trip) {
    navigate('/purchase', { state: { trip, ...criteria } })
  }

  // Hora de salida en la estación de origen elegida (no la del inicio de la
  // ruta): el mismo dato que muestra cada TripCard.
  function departureAt(trip) {
    const iso = findStop(trip, criteria?.origin?.name)?.estimatedTime ?? trip.departureTime
    return new Date(iso).getTime()
  }

  const sortedResults = results
    ? [...results].sort((a, b) => {
        const diff = sortBy === 'price' ? (a.price ?? Infinity) - (b.price ?? Infinity) : departureAt(a) - departureAt(b)
        return sortDir === 'asc' ? diff : -diff
      })
    : results

  const stationPlaceholder = loadingStations ? t('common.loading') : t('common.selectStation')
  const stationOptions = (
    <>
      <option value="">{stationPlaceholder}</option>
      {stations.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} ({s.city})
        </option>
      ))}
    </>
  )
  const originLabel = stationLabel(stations.find((s) => String(s.id) === String(form.from)))
  const destinationLabel = stationLabel(stations.find((s) => String(s.id) === String(form.to)))

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-brand-100 bg-brand-50/50 p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('search.heading')}</h1>
        <p className="mt-1 text-sm text-slate-500">{t('search.subtitle')}</p>

        {stationsError && (
          <div className="mt-4">
            <Alert>{t('search.stationsLoadError', { message: stationsError })}</Alert>
          </div>
        )}

        <form onSubmit={handleSearch} noValidate className="mt-6">
          {/* Tablet / escritorio: una fila que se reparte todo el ancho y, si no
              cabe, pasa a dos filas (origen+destino arriba, resto debajo). */}
          <div className="hidden flex-wrap items-end gap-3 md:flex">
            <div className="flex min-w-[420px] flex-[3] items-end gap-2">
              <StationSelect
                id="from"
                label={t('search.origin')}
                required
                disabled={loadingStations}
                error={fieldErrors.from}
                className="min-w-0 flex-1"
                value={form.from}
                displayValue={originLabel}
                placeholder={stationPlaceholder}
                onChange={(e) => {
                  setForm({ ...form, from: e.target.value })
                  clearFieldError('from')
                }}
              >
                {stationOptions}
              </StationSelect>

              <button
                type="button"
                onClick={handleSwap}
                aria-label={t('search.swap')}
                title={t('search.swap')}
                style={{ transform: `rotate(${swapSpins * 180}deg)` }}
                className="mb-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-brand-700 transition-transform duration-300 hover:border-brand-300 hover:bg-brand-50 motion-reduce:transition-none"
              >
                <SwapIcon />
              </button>

              <StationSelect
                id="to"
                label={t('search.destination')}
                required
                disabled={loadingStations}
                error={fieldErrors.to}
                className="min-w-0 flex-1"
                value={form.to}
                displayValue={destinationLabel}
                placeholder={stationPlaceholder}
                onChange={(e) => {
                  setForm({ ...form, to: e.target.value })
                  clearFieldError('to')
                }}
              >
                {stationOptions}
              </StationSelect>
            </div>

            {/* Fecha, pasajeros y buscar viajan juntos: si no caben en la
                fila de arriba, bajan los tres a la vez a una segunda fila.
                Fecha y pasajeros mantienen un ancho fijo cómodo (no se
                estiran) y "Buscar" se ancla al borde derecho, para que la
                fila siga ocupando todo el ancho de la tarjeta. */}
            <div className="flex min-w-[470px] flex-[2] items-end gap-3">
              <Input
                id="date"
                label={t('search.date')}
                type="date"
                required
                error={fieldErrors.date}
                className="w-[170px] shrink-0"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value })
                  clearFieldError('date')
                }}
              />

              <Stepper
                id="passengers"
                label={t('search.passengers')}
                required
                className="w-[150px] shrink-0"
                value={form.passengers}
                onChange={(n) => setForm({ ...form, passengers: n })}
              />

              <button
                type="submit"
                disabled={searching || loadingStations}
                aria-describedby={error ? 'search-error' : undefined}
                className="ml-auto flex h-10 w-28 shrink-0 items-center justify-center rounded-lg bg-brand-700 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                {searching ? t('search.searching') : t('search.search')}
              </button>
            </div>
          </div>

          {/* Móvil: tarjeta vertical tipo billete, con el intercambio sobre la
              línea que une origen y destino. */}
          <div className="md:hidden">
            <div className="relative flex gap-3">
              <div className="flex w-5 shrink-0 flex-col items-center py-2" aria-hidden="true">
                <span className="size-2 shrink-0 rounded-full bg-brand-600" />
                <span className="my-1 w-px flex-1 bg-slate-200" />
                <span className="size-2 shrink-0 rounded-full bg-slate-400" />
              </div>

              <div className="min-w-0 flex-1 divide-y divide-dashed divide-slate-200">
                <div className="pb-3 pr-10">
                  <StationSelect
                    id="from-m"
                    label={t('search.origin')}
                    required
                    disabled={loadingStations}
                    error={fieldErrors.from}
                    value={form.from}
                    displayValue={originLabel}
                    placeholder={stationPlaceholder}
                    onChange={(e) => {
                      setForm({ ...form, from: e.target.value })
                      clearFieldError('from')
                    }}
                  >
                    {stationOptions}
                  </StationSelect>
                </div>
                <div className="pt-3 pr-10">
                  <StationSelect
                    id="to-m"
                    label={t('search.destination')}
                    required
                    disabled={loadingStations}
                    error={fieldErrors.to}
                    value={form.to}
                    displayValue={destinationLabel}
                    placeholder={stationPlaceholder}
                    onChange={(e) => {
                      setForm({ ...form, to: e.target.value })
                      clearFieldError('to')
                    }}
                  >
                    {stationOptions}
                  </StationSelect>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                aria-label={t('search.swap')}
                title={t('search.swap')}
                style={{ transform: `translateY(-50%) rotate(${swapSpins * 180}deg)` }}
                className="absolute right-0 top-1/2 flex size-8 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-brand-700 shadow-sm transition-transform duration-300 hover:border-brand-300 hover:bg-brand-50 motion-reduce:transition-none"
              >
                <SwapIcon vertical className="size-3.5" />
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <Input
                id="date-m"
                label={t('search.date')}
                type="date"
                required
                error={fieldErrors.date}
                className="flex-1"
                value={form.date}
                onChange={(e) => {
                  setForm({ ...form, date: e.target.value })
                  clearFieldError('date')
                }}
              />
              <Stepper
                id="passengers-m"
                label={t('search.passengers')}
                required
                className="flex-1"
                value={form.passengers}
                onChange={(n) => setForm({ ...form, passengers: n })}
              />
            </div>

            <button
              type="submit"
              disabled={searching || loadingStations}
              aria-describedby={error ? 'search-error' : undefined}
              className="mt-4 w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 active:scale-[0.98] motion-reduce:active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
            >
              {searching ? t('search.searching') : t('search.search')}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4">
            <Alert ref={errorRef} id="search-error">
              {error}
            </Alert>
          </div>
        )}

        {recentSearches.length > 0 && (
          <div className="mt-5 border-t border-brand-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {t('search.recentSearches')}
            </p>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((entry) => (
                <button
                  key={`${entry.fromId}-${entry.toId}-${entry.date}-${entry.passengers}`}
                  type="button"
                  onClick={() => applyRecentSearch(entry)}
                  className="inline-flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <HistoryIcon className="mt-0.5 size-3.5 shrink-0 text-slate-400" />
                  <span>
                    <span className="block font-semibold text-slate-900">
                      {entry.fromLabel} → {entry.toLabel}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {formatDate(entry.date, language)} ·{' '}
                      {t('search.recentPax', { count: entry.passengers })}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {searching && <Spinner label={t('search.searchingTrips')} />}

      {!searching && results && criteria && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2>
              <span className="block text-lg font-semibold text-slate-900">
                {t('search.resultsHeading', { count: results.length })}
              </span>
              <span className="mt-0.5 block text-xs text-slate-400">
                {criteria.origin?.name} → {criteria.destination?.name} · {formatDate(criteria.date, language)} ·{' '}
                {t('search.passengersCount', { count: criteria.passengers })}
              </span>
            </h2>

            {results.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">{t('search.sortBy')}</span>
                {[
                  { field: 'time', label: t('search.sortTime') },
                  { field: 'price', label: t('search.sortPrice') },
                ].map(({ field, label }) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => handleSort(field)}
                    aria-pressed={sortBy === field}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 font-medium transition ${
                      sortBy === field
                        ? 'border-brand-300 bg-brand-50 text-brand-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                    {sortBy === field && (
                      <SortIcon className={`size-3.5 transition-transform ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {results.length === 0 ? (
            <Alert type="info">{t('search.noResults')}</Alert>
          ) : (
            sortedResults.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                origin={criteria.origin}
                destination={criteria.destination}
                passengers={criteria.passengers}
                onBuy={handleBuy}
              />
            ))
          )}
        </section>
      )}
    </div>
  )
}
