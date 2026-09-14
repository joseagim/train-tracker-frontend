import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import TripCard from '../components/TripCard'
import * as api from '../services/api'
import { formatDate, todayISODate } from '../utils/format'

const SEARCH_CACHE_KEY = 'tt_last_search'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200'
const labelClass = 'mb-1 block text-sm font-medium text-slate-700'

function loadCachedSearch() {
  try {
    const raw = sessionStorage.getItem(SEARCH_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export default function SearchPage() {
  const cached = loadCachedSearch()

  const [stations, setStations] = useState([])
  const [stationsError, setStationsError] = useState('')
  const [loadingStations, setLoadingStations] = useState(true)

  const [form, setForm] = useState(
    cached?.form ?? { from: '', to: '', date: todayISODate(), passengers: 1 },
  )
  const [results, setResults] = useState(cached?.results ?? null)
  const [criteria, setCriteria] = useState(cached?.criteria ?? null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const navigate = useNavigate()

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

    if (form.from === form.to) {
      setError('El origen y el destino deben ser distintos.')
      return
    }

    const origin = stations.find((s) => String(s.id) === String(form.from))
    const destination = stations.find((s) => String(s.id) === String(form.to))

    setSearching(true)
    setResults(null)
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
      try {
        sessionStorage.setItem(
          SEARCH_CACHE_KEY,
          JSON.stringify({ form, results: trips, criteria: nextCriteria }),
        )
      } catch {
        // sessionStorage no disponible: la caché es opcional.
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  function handleBuy(trip) {
    navigate('/purchase', { state: { trip, ...criteria } })
  }

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Buscar viajes</h1>
        <p className="mt-1 text-sm text-slate-500">
          Consulta los trenes disponibles entre dos estaciones.
        </p>

        {stationsError && (
          <div className="mt-4">
            <Alert>No se han podido cargar las estaciones: {stationsError}</Alert>
          </div>
        )}

        <form onSubmit={handleSearch} className="mt-5 grid gap-4 md:grid-cols-5">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="from">
              Origen
            </label>
            <select
              id="from"
              required
              disabled={loadingStations}
              className={inputClass}
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            >
              <option value="">{loadingStations ? 'Cargando…' : 'Selecciona estación'}</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="to">
              Destino
            </label>
            <select
              id="to"
              required
              disabled={loadingStations}
              className={inputClass}
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            >
              <option value="">{loadingStations ? 'Cargando…' : 'Selecciona estación'}</option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass} htmlFor="date">
              Fecha
            </label>
            <input
              id="date"
              type="date"
              required
              className={inputClass}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="passengers">
              Pasajeros
            </label>
            <input
              id="passengers"
              type="number"
              min={1}
              max={10}
              required
              className={inputClass}
              value={form.passengers}
              onChange={(e) => setForm({ ...form, passengers: e.target.value })}
            />
          </div>

          <div className="flex items-end md:col-span-4">
            <button
              type="submit"
              disabled={searching || loadingStations}
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 md:w-auto"
            >
              {searching ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4">
            <Alert>{error}</Alert>
          </div>
        )}
      </section>

      {searching && <Spinner label="Buscando viajes…" />}

      {!searching && results && criteria && (
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-500">
            {results.length} viaje{results.length === 1 ? '' : 's'} · {criteria.origin?.name} →{' '}
            {criteria.destination?.name} · {formatDate(criteria.date)} · {criteria.passengers}{' '}
            pasajero{criteria.passengers === 1 ? '' : 's'}
          </h2>

          {results.length === 0 ? (
            <Alert type="info">No hay viajes disponibles para esos criterios.</Alert>
          ) : (
            results.map((trip) => (
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
