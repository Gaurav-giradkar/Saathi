import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts'

export function PainTrendChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="painFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E85D75" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E85D75" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#F3EAEC" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#A6949F' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#A6949F' }} axisLine={false} tickLine={false} width={24} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0DDE2', fontSize: 12 }} />
        <Area type="monotone" dataKey="pain" stroke="#E85D75" strokeWidth={2.5} fill="url(#painFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CycleLengthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#F3EAEC" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#A6949F' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#A6949F' }} axisLine={false} tickLine={false} width={24} domain={[20, 34]} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #F0DDE2', fontSize: 12 }} />
        <Bar dataKey="length" fill="#6B5B95" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
