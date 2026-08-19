import React, { useState } from 'react'
import * as Icons from 'lucide-react'
import { Check, X, Star, ShoppingCart, HelpCircle, Info } from 'lucide-react'
import Card from '../components/common/Card.jsx'
import { PRODUCTS } from '../data/mockData.js'

function Stars({ count }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < count ? 'text-amber-400 fill-amber-400' : 'text-ink-100 fill-ink-100'}
        />
      ))}
    </div>
  )
}

export default function SupporterProductAdvisor() {
  const [expanded, setExpanded] = useState(null)

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Product guide for supporters
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Learn about menstrual products, absorbency levels, and terminology to help you pick up supplies with confidence.
        </p>
      </div>

      {/* Helper's Purchasing Tips Card */}
      <Card className="bg-teal-50/60 border-teal-100">
        <div className="flex items-center gap-2 mb-2">
          <ShoppingCart size={18} className="text-teal-600" />
          <h2 className="font-display font-semibold text-ink-900 text-base">
            Quick Tips When Buying Supplies
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs sm:text-sm text-ink-700">
          <div className="p-3 rounded-lg bg-surface/80 border border-teal-200/60">
            <p className="font-semibold text-ink-900 mb-0.5">1. Check the Brand & Type</p>
            <p className="text-ink-500">Take a photo of the existing packaging or ask for the specific brand and version (e.g. Regular vs Overnight).</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/80 border border-teal-200/60">
            <p className="font-semibold text-ink-900 mb-0.5">2. Check with or without Wings</p>
            <p className="text-ink-500">For sanitary pads, "with wings" indicates adhesive side flaps that wrap around underwear for extra security.</p>
          </div>
          <div className="p-3 rounded-lg bg-surface/80 border border-teal-200/60">
            <p className="font-semibold text-ink-900 mb-0.5">3. Choose Unscented</p>
            <p className="text-ink-500">Unless specifically requested, unscented products are generally preferred to avoid skin irritation.</p>
          </div>
        </div>
      </Card>

      {/* Product Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRODUCTS.map((p) => {
          const Icon = Icons[p.icon] || Icons.Package
          const isOpen = expanded === p.id
          return (
            <Card key={p.id} hover className="flex flex-col">
              <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <Icon size={20} className="text-teal-600" strokeWidth={2} />
              </div>
              <h3 className="font-display font-semibold text-ink-900 text-base mb-1">
                {p.name}
              </h3>
              <p className="text-xs text-ink-500 mb-3 text-justify leading-relaxed">
                {p.bestFor}
              </p>
              <div className="flex items-center justify-between text-xs text-ink-500 mb-1">
                <span>Comfort</span>
                <Stars count={p.comfort} />
              </div>
              <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                <span>Eco-friendliness</span>
                <Stars count={p.ecoScore} />
              </div>
              <p className="text-sm font-semibold text-ink-800 mb-3">
                {p.costPerCycle}{' '}
                <span className="text-xs text-ink-400 font-normal">/ cycle</span>
              </p>
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="text-sm font-semibold text-teal-700 hover:text-teal-800 mt-auto text-left"
              >
                {isOpen ? 'Hide details' : 'See pros & cons'}
              </button>
              {isOpen && (
                <div className="mt-3 pt-3 border-t border-ink-100 flex flex-col gap-2 animate-fadeIn">
                  {p.pros.map((pro, i) => (
                    <p key={i} className="text-xs text-ink-600 flex gap-1.5">
                      <Check size={13} className="text-teal-500 mt-0.5 shrink-0" /> {pro}
                    </p>
                  ))}
                  {p.cons.map((con, i) => (
                    <p key={i} className="text-xs text-ink-600 flex gap-1.5">
                      <X size={13} className="text-rose-400 mt-0.5 shrink-0" /> {con}
                    </p>
                  ))}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Comparison Table */}
      <Card padded={false} className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-ink-200 text-xs text-ink-700 uppercase tracking-wide bg-ink-50/50">
              <th className="py-3 px-5 text-left font-semibold">Product Category</th>
              <th className="py-3 px-5 text-left font-semibold">Absorbency & Capacity</th>
              <th className="py-3 px-5 text-center font-semibold">Reusable</th>
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p, i) => (
              <tr
                key={p.id}
                className={i !== PRODUCTS.length - 1 ? 'border-b border-ink-100' : ''}
              >
                <td className="py-3 px-5 font-medium text-ink-800">
                  {p.name}
                </td>
                <td className="py-3 px-5 text-ink-600 text-sm">
                  {p.absorbency}
                </td>
                <td className="py-3 px-5 text-center">
                  {p.reusable ? (
                    <Check size={16} className="text-teal-500 mx-auto" />
                  ) : (
                    <X size={16} className="text-ink-300 mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Platform Disclaimer */}
      <Card className="flex items-start gap-3 bg-bg border-ink-100">
        <Info size={16} className="text-ink-400 mt-0.5 shrink-0" />
        <p className="text-xs text-ink-500 leading-relaxed">
          Educational guide only. Saathi is an educational and cycle-support platform and does not sell or endorse specific commercial products.
        </p>
      </Card>
    </div>
  )
}
