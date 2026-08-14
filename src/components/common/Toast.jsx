import React from 'react'
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react'
import { useApp } from '../../context/AppContext.jsx'

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info }
const STYLES = {
  success: 'border-teal-200 bg-teal-50 text-teal-700',
  warning: 'border-amber-100 bg-amber-50 text-amber-600',
  info: 'border-plum-100 bg-plum-50 text-plum-600',
}

export default function ToastHost() {
  const { toasts, dismissToast } = useApp()
  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 w-[min(360px,90vw)]">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || CheckCircle2
        return (
          <div
            key={t.id}
            className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 shadow-lift animate-toastIn ${STYLES[t.variant] || STYLES.success}`}
          >
            <Icon size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm font-medium flex-1">{t.message}</p>
            <button onClick={() => dismissToast(t.id)} className="opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
