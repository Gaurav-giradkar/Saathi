import React, { useEffect, useState } from 'react'
import { ShieldCheck, Lock } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import Toggle from '../components/common/Toggle.jsx'
import { SHARING_CATEGORIES } from '../data/mockData.js'
import { getSharingPermissions, updateSharingPermissions } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

export default function SharingPermissions() {
  const [perms, setPerms] = useState(null)
  const { showToast } = useApp()

  useEffect(() => {
    getSharingPermissions().then(setPerms)
  }, [])

  const handleToggle = async (key, value) => {
    setPerms((p) => ({ ...p, [key]: value }))
    await updateSharingPermissions(key, value)
    showToast(value ? 'Now sharing with your supporter' : 'Made private', value ? 'success' : 'info')
  }

  if (!perms) return <div className="animate-pulse text-ink-400 text-sm py-20 text-center">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Sharing permissions</h1>
        <p className="text-ink-500 text-sm mt-1">Choose exactly what your connected supporter can see.</p>
      </div>

      <Card className="flex items-start gap-3 bg-plum-50/60 border-plum-100">
        <ShieldCheck size={20} className="text-plum-500 mt-0.5 shrink-0" />
        <p className="text-sm text-plum-700 leading-relaxed">
          You are always in control. Anything switched off here stays completely private, no matter what your
          supporter's app shows.
        </p>
      </Card>

      <Card padded={false}>
        {SHARING_CATEGORIES.map((cat, i) => (
          <div
            key={cat.key}
            className={[
              'flex items-center justify-between gap-4 px-5 sm:px-6 py-4',
              i !== SHARING_CATEGORIES.length - 1 ? 'border-b border-ink-100' : '',
            ].join(' ')}
          >
            <div>
              <p className="font-medium text-ink-800 text-sm flex items-center gap-1.5">
                {cat.label}
                {cat.locked && <Lock size={12} className="text-ink-300" />}
              </p>
              <p className="text-xs text-ink-500 mt-0.5">{cat.desc}</p>
            </div>
            <Toggle
              checked={perms[cat.key]}
              onChange={(v) => handleToggle(cat.key, v)}
              disabled={cat.locked}
              locked={cat.locked}
            />
          </div>
        ))}
      </Card>
    </div>
  )
}
