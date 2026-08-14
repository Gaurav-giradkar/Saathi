import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { Check, X, Star } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import { PRODUCTS } from '../data/mockData.js'

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < count ? 'text-amber-400 fill-amber-400' : 'text-ink-100 fill-ink-100'} />
      ))}
    </div>
  )
}

export default function ProductAdvisor() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">Product advisor</h1>
        <p className="text-ink-500 text-sm mt-1">Compare menstrual products by comfort, cost, and lifestyle fit.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCTS.map((p) => {
          const Icon = Icons[p.icon] || Icons.Package
          const isOpen = expanded === p.id
          return (
            <Card key={p.id} hover className="flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center mb-3">
                <Icon size={20} className="text-rose-500" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-base mb-1">{p.name}</h3>
              <p className="text-xs text-ink-500 mb-3">{p.bestFor}</p>
              <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
                <span>Comfort</span><Stars count={p.comfort} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                <span>Eco-friendliness</span><Stars count={p.ecoScore} />
              </div>
              <p className="text-sm font-semibold text-ink-800 mb-3">{p.costPerCycle} <span className="text-xs text-ink-400 font-normal">/ cycle</span></p>
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="text-sm font-semibold text-rose-600 hover:text-rose-700 mt-auto text-left"
              >
                {isOpen ? 'Hide details' : 'See pros & cons'}
              </button>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex flex-col gap-2 animate-fadeIn">
                  {p.pros.map((pro, i) => (
                    <p key={i} className="text-xs text-ink-600 flex gap-1.5"><Check size={13} className="text-teal-500 mt-0.5 shrink-0" /> {pro}</p>
                  ))}
                  {p.cons.map((con, i) => (
                    <p key={i} className="text-xs text-ink-600 flex gap-1.5"><X size={13} className="text-rose-400 mt-0.5 shrink-0" /> {con}</p>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-ink-100 text-left text-xs text-ink-500 uppercase tracking-wide">
              <th className="py-3 px-5 font-semibold">Product</th>
              <th className="py-3 px-5 font-semibold">Absorbency</th>
              <th className="py-3 px-5 font-semibold">Reusable</th>
              <th className="py-3 px-5 font-semibold">Cost / cycle</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p, i) => (
              <tr key={p.id} className={i !== PRODUCTS.length - 1 ? 'border-b border-ink-100' : ''}>
                <td className="py-3 px-5 font-medium text-ink-800">{p.name}</td>
                <td className="py-3 px-5 text-ink-600">{p.absorbency}</td>
                <td className="py-3 px-5">
                  {p.reusable ? <Check size={16} className="text-teal-500" /> : <X size={16} className="text-ink-300" />}
                </td>
                <td className="py-3 px-5 text-ink-600">{p.costPerCycle}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
