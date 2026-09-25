import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import TicketCard from '../components/TicketCard'
import { useLanguage } from '../context/language-context'
import useDocumentTitle from '../hooks/useDocumentTitle'
import * as api from '../services/api'

export default function MyTicketsPage() {
  const { t } = useLanguage()
  useDocumentTitle(t('myTickets.docTitle'))
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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{t('myTickets.heading')}</h1>

      {loading && <Spinner label={t('myTickets.loading')} />}
      {!loading && error && <Alert>{error}</Alert>}

      {!loading && !error && tickets.length === 0 && (
        <div className="space-y-4">
          <Alert type="info">{t('myTickets.empty')}</Alert>
          <Link
            to="/"
            className="inline-block rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            {t('myTickets.searchTrips')}
          </Link>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.uuid ?? ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  )
}
