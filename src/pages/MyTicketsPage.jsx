import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import TicketCard from '../components/TicketCard'
import * as api from '../services/api'

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    api
      .getMyTickets()
      .then((list) => {
        if (active) setTickets(list ?? [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Mis billetes</h1>

      {loading && <Spinner label="Cargando billetes…" />}
      {!loading && error && <Alert>{error}</Alert>}

      {!loading && !error && tickets.length === 0 && (
        <div className="space-y-4">
          <Alert type="info">Todavía no has comprado ningún billete.</Alert>
          <Link
            to="/"
            className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Buscar viajes
          </Link>
        </div>
      )}

      {!loading &&
        tickets.map((ticket) => <TicketCard key={ticket.uuid ?? ticket.id} ticket={ticket} />)}
    </div>
  )
}
