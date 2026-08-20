import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar,
} from 'recharts'

export function PainTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-ink-400 text-xs italic bg-ink-50/40 rounded-xl">
        No pain entries recorded for this period.
      </div>
    )
  }

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="painFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E85D75" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#E85D75" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F3EAEC" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#958A99' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#958A99' }} axisLine={false} tickLine={false} width={28} domain={[0, 10]} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #F0DDE2',
              backgroundColor: '#FFFBFD',
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(67, 44, 74, 0.08)',
            }}
            formatter={(value) => [`${value}/10`, 'Pain Level']}
          />
          <Area type="monotone" dataKey="pain" stroke="#E85D75" strokeWidth={2.25} fill="url(#painFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CycleLengthChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-36 flex items-center justify-center text-ink-400 text-xs italic bg-ink-50/40 rounded-xl">
        No cycle history recorded yet.
      </div>
    )
  }

  // Calculate dynamic domain based on available values
  const lengths = data.map((d) => Number(d.length)).filter(Boolean)
  const minVal = lengths.length > 0 ? Math.max(15, Math.min(...lengths) - 4) : 20
  const maxVal = lengths.length > 0 ? Math.min(45, Math.max(...lengths) + 4) : 36

  return (
    <div className="w-full h-40">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: -24, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#F3EAEC" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#958A99' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#958A99' }} axisLine={false} tickLine={false} width={28} domain={[minVal, maxVal]} />
          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: '1px solid #E8DDEB',
              backgroundColor: '#FFFBFD',
              fontSize: 12,
              boxShadow: '0 2px 8px rgba(67, 44, 74, 0.08)',
            }}
            formatter={(value) => [`${value} days`, 'Cycle Length']}
          />
          <Bar dataKey="length" fill="#6B5B95" radius={[5, 5, 0, 0]} maxBarSize={26} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
