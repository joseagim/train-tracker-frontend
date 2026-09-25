import { useLanguage } from '../../context/language-context'

export default function Stepper({ id, label, required, value, onChange, min = 1, max = 10, className = '' }) {
  const { t } = useLanguage()
  const labelId = `${id}-label`

  return (
    <div className={className}>
      <span className="mb-1 block text-sm font-medium text-slate-700" id={labelId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="flex h-10 items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white"
      >
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={t('search.decrementPassenger')}
          className="flex w-9 shrink-0 items-center justify-center text-base font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        >
          −
        </button>
        <span
          id={id}
          aria-live="polite"
          className="flex flex-1 items-center justify-center text-sm font-semibold tabular-nums text-slate-900"
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={t('search.incrementPassenger')}
          className="flex w-9 shrink-0 items-center justify-center text-base font-semibold text-brand-700 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        >
          +
        </button>
      </div>
    </div>
  )
}
