import React from 'react'

export default function Input({ label, error, hint, icon: Icon, className = '', id, ...props }) {
  const inputId = id || label?.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />}
        <input
          id={inputId}
          className={[
            'w-full rounded-xl border bg-white text-ink-800 placeholder:text-ink-300',
            'px-4 py-2.5 text-sm transition-colors duration-150',
            Icon ? 'pl-10' : '',
            error ? 'border-rose-500 focus:ring-rose-200' : 'border-ink-100 focus:border-rose-400',
            'focus:outline-none focus:ring-4 focus:ring-rose-100',
            className,
          ].join(' ')}
          {...props}
        />
      </div>
      {hint && !error && <p className="mt-1.5 text-xs text-ink-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-rose-600 font-medium">{error}</p>}
    </div>
  )
}
