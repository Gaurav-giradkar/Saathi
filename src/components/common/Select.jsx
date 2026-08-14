import React from 'react'
import { ChevronDown } from 'lucide-react'

export default function Select({ label, options, className = '', id, ...props }) {
  const selectId = id || label?.replace(/\s+/g, '-').toLowerCase()
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-ink-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={[
            'w-full appearance-none rounded-xl border border-ink-100 bg-white text-ink-800',
            'px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400',
            className,
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-300 pointer-events-none" />
      </div>
    </div>
  )
}
