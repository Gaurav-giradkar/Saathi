import React, { useEffect, useState } from 'react'
import Modal from '../common/Modal.jsx'
import Button from '../common/Button.jsx'
import {
  HeartPulse, Activity, Moon, Droplets, Dumbbell, Utensils, Sparkles, Smile, ShieldCheck, FileText, CheckCircle2,
} from 'lucide-react'
import { getDailyAISummary } from '../../data/api.js'

export default function DayDetailModal({ log, cycleInfo, open, onClose }) {
  const [dailySummary, setDailySummary] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  useEffect(() => {
    if (log?.date && open) {
      setLoadingSummary(true)
      getDailyAISummary(log.date)
        .then((res) => setDailySummary(res))
        .catch(() => setDailySummary(null))
        .finally(() => setLoadingSummary(false))
    } else {
      setDailySummary(null)
      setLoadingSummary(false)
    }
  }, [log?.date, open])

  if (!log) return null

  const formattedDate = log.date
    ? new Date(`${log.date}T00:00:00`).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Day details'

  const painLocations = Array.isArray(log.painLocations) ? log.painLocations : []
  const painTypes = Array.isArray(log.painTypes) ? log.painTypes : []
  const symptoms = Array.isArray(log.symptoms) ? log.symptoms : []
  const moods = Array.isArray(log.moods) ? log.moods : log.mood ? [log.mood] : []
  const relief = Array.isArray(log.relief) ? log.relief : []
  const exerciseActivities = Array.isArray(log.exerciseActivities) ? log.exerciseActivities : log.exercise ? [log.exercise] : []
  const meals = Array.isArray(log.meals) ? log.meals : log.diet ? [log.diet] : []
  const cravings = Array.isArray(log.cravings) ? log.cravings : []
  const protectionUsed = Array.isArray(log.productOptions) ? log.productOptions : Array.isArray(log.protectionUsed) ? log.protectionUsed : []

  return (
    <Modal open={open} onClose={onClose} title={formattedDate} size="lg" position='bottom'>
      <div className="flex flex-col gap-4 text-sm">

        {/* Stored Daily AI Report */}
        {loadingSummary ? (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50/50 to-surface border border-rose-100 flex items-center gap-2.5 text-xs text-ink-500 animate-pulse">
            <Sparkles size={15} className="text-rose-500 animate-spin" />
            <span>Loading daily report…</span>
          </div>
        ) : dailySummary && dailySummary.summary ? (
          <div className="p-4 rounded-xl bg-gradient-to-br from-surface to-rose-50/40 border border-rose-200/80 shadow-soft">
            <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <Sparkles size={15} />
              <span>Saathi Daily Report</span>
            </div>
            <p className="text-sm text-ink-800 leading-relaxed font-medium">
              {dailySummary.summary}
            </p>
            {Array.isArray(dailySummary.keyPoints) && dailySummary.keyPoints.length > 0 && (
              <ul className="mt-2.5 space-y-1 text-xs text-ink-600 list-disc list-inside">
                {dailySummary.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            )}
          </div>
        ) : null}

        {/* Symptoms Section */}
        {symptoms.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <div className="flex items-center gap-2 text-rose-700 font-semibold text-xs uppercase tracking-wider mb-2">
              <HeartPulse size={15} />
              <span>Symptoms Logged</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {symptoms.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-1 rounded-full bg-white text-ink-800 text-xs font-medium border border-rose-200/80 shadow-xs"
                >
                  {s}
                </span>
              ))}
              {log.otherSymptom && (
                <span className="px-2.5 py-1 rounded-full bg-white text-ink-800 text-xs font-medium border border-rose-200/80 shadow-xs">
                  {log.otherSymptom}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pain & Discomfort */}
        <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Pain Level</span>
            <span className="text-sm font-bold text-rose-600">
              {log.pain != null && log.pain !== '' ? `${log.pain} / 10` : 'Not recorded'}
            </span>
          </div>
          {(painLocations.length > 0 || painTypes.length > 0 || log.otherPainLocation || log.otherPainType) && (
            <div className="text-xs text-ink-600 mt-2 space-y-1">
              {painLocations.length > 0 && (
                <p>
                  <strong className="text-ink-700">Location:</strong> {painLocations.join(', ')}
                  {log.otherPainLocation ? ` (${log.otherPainLocation})` : ''}
                </p>
              )}
              {painTypes.length > 0 && (
                <p>
                  <strong className="text-ink-700">Type:</strong> {painTypes.join(', ')}
                  {log.otherPainType ? ` (${log.otherPainType})` : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Mood & Energy */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Smile size={14} className="text-amber-500" />
              <span>Mood</span>
            </div>
            <p className="text-sm font-semibold text-ink-800">
              {moods.length > 0 ? moods.join(', ') : 'Not recorded'}
            </p>
            {log.stress && (
              <p className="text-xs text-ink-500 mt-1">Stress level: {log.stress}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Activity size={14} className="text-teal-600" />
              <span>Energy</span>
            </div>
            <p className="text-sm font-semibold text-ink-800">
              {log.energy || 'Not recorded'}
            </p>
            {log.activity && (
              <p className="text-xs text-ink-500 mt-1">Activity: {log.activity}</p>
            )}
          </div>
        </div>

        {/* Sleep & Hydration */}
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Moon size={14} className="text-plum-500" />
              <span>Sleep</span>
            </div>
            <p className="text-sm font-semibold text-ink-800">
              {log.sleep != null && log.sleep !== '' ? `${log.sleep} hrs` : 'Not recorded'}
            </p>
            {log.sleepQuality && (
              <p className="text-xs text-ink-500 mt-1">Quality: {log.sleepQuality}</p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Droplets size={14} className="text-teal-500" />
              <span>Hydration</span>
            </div>
            <p className="text-sm font-semibold text-ink-800">
              {log.waterLiters != null && log.waterLiters !== '' ? `${log.waterLiters} L` : log.water != null ? `${log.water} glasses` : 'Not recorded'}
            </p>
          </div>
        </div>

        {/* Movement & Exercise */}
        {(exerciseActivities.length > 0 || log.exerciseMinutes || log.exerciseIntensity) && (
          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Dumbbell size={14} className="text-amber-500" />
              <span>Movement & Exercise</span>
            </div>
            <p className="text-sm text-ink-800 font-medium">
              {exerciseActivities.join(', ')}
              {log.otherExercise ? ` (${log.otherExercise})` : ''}
            </p>
            {(log.exerciseMinutes || log.exerciseIntensity) && (
              <p className="text-xs text-ink-500 mt-1">
                {log.exerciseMinutes ? `${log.exerciseMinutes} minutes` : ''}
                {log.exerciseMinutes && log.exerciseIntensity ? ' • ' : ''}
                {log.exerciseIntensity ? `Intensity: ${log.exerciseIntensity}` : ''}
              </p>
            )}
          </div>
        )}

        {/* Meals & Cravings */}
        {(meals.length > 0 || cravings.length > 0 || log.appetite) && (
          <div className="p-3.5 rounded-xl bg-surface border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
              <Utensils size={14} className="text-teal-600" />
              <span>Meals & Appetite</span>
            </div>
            {meals.length > 0 && (
              <p className="text-xs text-ink-700">
                <strong>Meals:</strong> {meals.join(', ')}
                {log.otherMeal ? ` (${log.otherMeal})` : ''}
              </p>
            )}
            {log.appetite && (
              <p className="text-xs text-ink-600 mt-0.5">
                <strong>Appetite:</strong> {log.appetite}
              </p>
            )}
            {cravings.length > 0 && (
              <p className="text-xs text-ink-600 mt-0.5">
                <strong>Cravings:</strong> {cravings.join(', ')}
                {log.otherCraving ? ` (${log.otherCraving})` : ''}
              </p>
            )}
          </div>
        )}

        {/* Period & Protection */}
        {(log.periodStatus !== 'none' && log.periodStatus) && (
          <div className="p-3.5 rounded-xl bg-rose-50/40 border border-rose-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1.5">
              <ShieldCheck size={14} />
              <span>Period & Bleeding</span>
            </div>
            <p className="text-sm font-semibold text-ink-900 capitalize">
              Status: {log.periodStatus}
              {log.bleeding ? ` (${log.bleeding} flow)` : ''}
            </p>
            {protectionUsed.length > 0 && (
              <p className="text-xs text-ink-600 mt-1">
                <strong>Products:</strong> {protectionUsed.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Relief Used */}
        {relief.length > 0 && (
          <div className="p-3.5 rounded-xl bg-plum-50/50 border border-plum-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-plum-700 uppercase tracking-wider mb-1.5">
              <Sparkles size={14} />
              <span>Relief Methods Used</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {relief.map((r) => (
                <span
                  key={r}
                  className="px-2 py-0.5 rounded-md bg-white text-plum-900 text-xs font-medium border border-plum-200"
                >
                  {r}
                </span>
              ))}
              {log.otherRelief && (
                <span className="px-2 py-0.5 rounded-md bg-white text-plum-900 text-xs font-medium border border-plum-200">
                  {log.otherRelief}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {log.notes && (
          <div className="p-3.5 rounded-xl bg-ink-50/70 border border-ink-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1.5">
              <FileText size={14} />
              <span>Personal Notes</span>
            </div>
            <p className="text-sm text-ink-800 whitespace-pre-wrap italic">
              "{log.notes}"
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex justify-end">
        <Button size="sm" variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  )
}
