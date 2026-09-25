const VARIANTS = {
  primary: 'bg-brand-700 text-white shadow-sm hover:bg-brand-800',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
  'outline-brand': 'border border-brand-300 text-brand-700 hover:border-brand-400 hover:bg-brand-50',
  'outline-danger': 'border border-red-300 text-red-700 hover:border-red-400 hover:bg-red-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
}

export function buttonClasses({ variant = 'primary', size = 'md', className = '' } = {}) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition',
    'disabled:cursor-not-allowed disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  ].join(' ')
}

export default function Button({ variant, size, className, ...props }) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />
}
