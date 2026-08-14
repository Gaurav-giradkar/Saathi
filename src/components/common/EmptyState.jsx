import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
          <Icon size={26} className="text-rose-400" strokeWidth={1.75} />
        </div>
      )}
      <h4 className="font-display font-semibold text-ink-800 text-base mb-1">{title}</h4>
      {description && <p className="text-sm text-ink-500 max-w-xs mb-4">{description}</p>}
      {action}
    </div>
  )
}
