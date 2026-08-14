import React from 'react'

export default function Toggle({ checked, onChange, label, disabled = false, locked = false }) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
      {label && <span className="text-sm text-ink-700">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 shrink-0',
          checked ? 'bg-teal-500' : 'bg-ink-100',
          locked ? 'opacity-70' : '',
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-[4px]',
          ].join(' ')}
        />
      </button>
    </label>
  )
}
