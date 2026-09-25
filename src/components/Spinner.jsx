export default function Spinner({ label = 'Cargando…' }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600 motion-reduce:animate-none"
      />
      {label}
    </div>
  )
}
