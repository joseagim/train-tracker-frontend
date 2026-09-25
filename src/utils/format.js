// Locale de formato asociado a cada idioma de la interfaz. El precio se
// formatea con este locale (separadores, posición del símbolo…) pero la
// divisa sigue siendo EUR: no convertimos importes, solo su presentación.
const LOCALES = { es: 'es-ES', en: 'en-GB' }

function localeFor(language) {
  return LOCALES[language] ?? LOCALES.es
}

export function formatTime(iso, language) {
  if (!iso) return '--:--'
  return new Intl.DateTimeFormat(localeFor(language), { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function formatDate(iso, language) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(localeFor(language), { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function formatDateTime(iso, language) {
  if (!iso) return ''
  return `${formatDate(iso, language)} · ${formatTime(iso, language)}`
}

export function formatPrice(value, language) {
  if (typeof value !== 'number') return '—'
  return new Intl.NumberFormat(localeFor(language), { style: 'currency', currency: 'EUR' }).format(value)
}

/** "seats" es un string de '1' (libre) y '0' (ocupado). */
export function countFreeSeats(seats) {
  if (!seats) return 0
  let free = 0
  for (const c of seats) if (c === '1') free++
  return free
}

/** Duración legible entre dos instantes ISO, p. ej. "2h 30min". */
export function formatDuration(fromIso, toIso) {
  if (!fromIso || !toIso) return ''
  const minutes = Math.round((new Date(toIso) - new Date(fromIso)) / 60000)
  if (minutes <= 0) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${m ? `${m}min` : ''}`.trim() : `${m}min`
}

/** Recorta un texto a `maxLength` caracteres añadiendo "…" si se pasa. */
export function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}…`
}

/** Fecha de hoy en formato YYYY-MM-DD (hora local), para el input date. */
export function todayISODate() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60000
  return new Date(now - offset).toISOString().slice(0, 10)
}

/**
 * Busca en las paradas del viaje la que corresponde a una estación,
 * para obtener su hora estimada de paso.
 */
export function findStop(trip, stationName) {
  return trip?.stations?.find((s) => s.name === stationName) ?? null
}

/**
 * Horas de paso de un billete: el viaje trae la hora de salida del primer
 * origen de la ruta y cada parada su desfase en minutos (minutesFromStart).
 * Devuelve { departure, arrival } en ISO, o null si falta información.
 */
export function ticketTimes(ticket) {
  const trip = ticket?.trip
  const stops = trip?.route?.routeStations
  if (!trip?.departureTime || !stops) return { departure: trip?.departureTime ?? null, arrival: null }

  const start = new Date(trip.departureTime).getTime()
  const offsetOf = (stationId) => {
    const stop = stops.find((rs) => rs.station?.id === stationId)
    return typeof stop?.minutesFromStart === 'number' ? stop.minutesFromStart : null
  }

  const fromOffset = offsetOf(ticket.origin?.id)
  const toOffset = offsetOf(ticket.destination?.id)

  return {
    departure: fromOffset === null ? trip.departureTime : new Date(start + fromOffset * 60000).toISOString(),
    arrival: toOffset === null ? null : new Date(start + toOffset * 60000).toISOString(),
  }
}
