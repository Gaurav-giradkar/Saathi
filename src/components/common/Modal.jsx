import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) {

  useEffect(() => {
  if (!open) return

  const onKey = (e) => {
    if (e.key === 'Escape') onClose?.()
  }

  window.addEventListener('keydown', onKey)

  return () => {
    window.removeEventListener('keydown', onKey)
  }
}, [open, onClose])

  if (!open) return null

  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-white/75 backdrop-blur-2xl animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative mx-auto w-full ${widths[size]}
          max-h-[88vh]
          bg-surface
          rounded-2xl
          shadow-lift
          animate-slideUp
          flex flex-col
          overflow-hidden
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 shrink-0">
          <h3 className="text-lg font-display font-semibold text-ink-900">
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full hover:bg-ink-100 text-ink-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-ink-100 flex justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}