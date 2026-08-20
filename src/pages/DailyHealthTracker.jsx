import React, { useEffect, useMemo, useState } from 'react'
import { Activity, Droplets, Dumbbell, HeartPulse, Moon, Save, Utensils } from 'lucide-react'
import Button from '../components/common/Button.jsx'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Toggle from '../components/common/Toggle.jsx'
import { SYMPTOM_OPTIONS } from '../data/mockData.js'
import { addCustomSymptom, getCustomSymptoms, getCycleData, getHealthData, saveHealthLog } from '../data/api.js'
import { useApp } from '../context/AppContext.jsx'

const moods = [
  'Happy',
  'Calm',
  'Good',
  'Content',
  'Neutral',
  'Okay',
  'Low',
  'Sad',
  'Anxious',
  'Stressed',
  'Irritable',
  'Angry',
  'Frustrated',
  'Emotional',
  'Overwhelmed',
  'Lonely',
  'Sensitive',
  'Energetic',
  'Relaxed',
  'Tired',
]

const lists = {
  painLocations: ['Lower abdomen', 'Pelvis', 'Lower back', 'Head', 'Breasts', 'Joints', 'Muscles', 'Other'],
  painTypes: ['Cramping', 'Dull', 'Sharp', 'Throbbing', 'Burning', 'Pressure', 'Other'],
  energy: ['Very Low', 'Low', 'Below Average', 'Medium', 'Above Average', 'High', 'Very High'],
  sleepIssues: ['Difficulty falling asleep', 'Woke up frequently', 'Woke up too early', 'Restless sleep', 'Nightmares', 'None'],
  exerciseActivities: ['None', 'Walking', 'Running', 'Cycling', 'Yoga', 'Pilates', 'Stretching', 'Strength training', 'Cardio', 'Swimming', 'Dance', 'Sports', 'Hiking', 'Other'],
  meals: ['Balanced', 'Light meals', 'Heavy meals', 'Skipped breakfast', 'Skipped lunch', 'Skipped dinner', 'Ate less than usual', 'Ate more than usual', 'Other'],
  cravings: ['None', 'Sweet', 'Salty', 'Spicy', 'Carbohydrates', 'Fast food', 'Chocolate', 'Fruits', 'Other'],
  wellbeing: ['Calm', 'Focused', 'Distracted', 'Stressed', 'Anxious', 'Overwhelmed', 'Motivated', 'Unmotivated'],
  protection: ['Pad', 'Tampon', 'Menstrual cup', 'Period underwear', 'Other'],
  relief: ['Heat', 'Rest', 'Stretching', 'Medication', 'Other', 'None'],
}

const blank = {
  symptoms: [],
  otherSymptom: '',
  pain: 0,
  painLocations: [],
  otherPainLocation: '',
  painTypes: [],
  otherPainType: '',
  moods: [],
  energy: '',
  usualActivityLimited: false,
  sleep: '',
  sleepQuality: '',
  sleepIssues: [],
  waterLiters: '',
  exerciseActivities: [],
  otherExercise: '',
  exerciseIntensity: '',
  exerciseMinutes: '',
  meals: [],
  otherMeal: '',
  appetite: '',
  cravings: [],
  otherCraving: '',
  activity: '',
  stress: '',
  mentalWellbeing: [],
  concentration: '',

  // Period tracking
  bleeding: '',
  flowChange: '',
  periodStarted: false,
  periodStatus: 'none',

  protectionUsed: [],
  otherProtection: '',
  productsUsed: '',
  productOptions: [],
  otherProduct: '',
  relief: [],
  otherRelief: '',
  notes: '',
}

const array = (value) => Array.isArray(value) ? value : value ? [value] : []

function Section({ title, description, icon: Icon, children }) {
  return (
    <Card className="!p-5 sm:!p-6">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <span className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
            <Icon size={18} />
          </span>
        )}

        <div>
          <h2 className="font-display text-lg font-semibold text-ink-900">
            {title}
          </h2>

          {description && (
            <p className="text-sm text-ink-500 mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </Card>
  )
}

function Chips({ options, value, onChange, max, none, label, single = false }) {
  const current = array(value)

  const change = (option) => {
    if (none && option === none) return onChange([none])

    const clean = current.filter((item) => item !== none)

    if (current.includes(option)) {
      return onChange(clean.filter((item) => item !== option))
    }

    if (single) return onChange([option])

    if (max && clean.length >= max) return

    onChange([...clean, option])
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
      {options.map((option) => {
        const active = current.includes(option)
        const disabled =
          max &&
          !active &&
          current.filter((item) => item !== none).length >= max

        return (
          <button
            type="button"
            key={option}
            aria-pressed={active}
            disabled={disabled}
            onClick={() => change(option)}
            className={`min-h-9 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
              active
                ? 'bg-rose-500 border-rose-500 text-white'
                : 'bg-white border-ink-100 text-ink-600 hover:border-rose-300'
            } disabled:opacity-40`}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

function Single({ options, value, onChange, label }) {
  return (
    <Chips
      options={options}
      value={value ? [value] : []}
      onChange={(next) => onChange(next[0] || '')}
      label={label}
      single
    />
  )
}

function OtherInput({ when, label, value, onChange }) {
  return when ? (
    <Input
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-3"
      maxLength="120"
    />
  ) : null
}

export default function DailyHealthTracker() {
  const today = new Date().toISOString().slice(0, 10)
  const { showToast } = useApp()

  const [selectedDate, setSelectedDate] = useState(today)
  const [record, setRecord] = useState(null)
  const [cycle, setCycle] = useState(null)
  const [saving, setSaving] = useState(false)
  const [symptomsExpanded, setSymptomsExpanded] = useState(false)
  const [customSymptoms, setCustomSymptoms] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    setRecord(null)

    Promise.all([
      getHealthData(selectedDate),
      getCycleData(),
      getCustomSymptoms(),
    ])
      .then(([log, cycleData, savedSymptoms]) => {
        const legacyMood = log?.mood
          ? [String(log.mood).replace(/^./, (x) => x.toUpperCase())]
          : []

        setRecord({
          ...blank,
          ...log,
          moods: log?.moods || legacyMood,
          sleep: log?.sleep ?? '',
          waterLiters:
            log?.waterLiters ??
            (log?.water != null ? Number(log.water) * 0.25 : ''),
        })

        setCycle(cycleData)
        setCustomSymptoms(savedSymptoms)
      })
      .catch((error) => {
        showToast(error.message, 'error')
        setRecord(blank)
      })
  }, [selectedDate])

  const set = (key, value) =>
    setRecord((state) => ({
      ...state,
      [key]: value,
    }))

  const availableSymptoms = useMemo(
    () =>
      [...SYMPTOM_OPTIONS, ...customSymptoms].filter(
        (item) => item.toLowerCase() !== 'stomach pain'
      ),
    [customSymptoms]
  )

  const shownSymptoms = useMemo(
    () =>
      availableSymptoms.filter((item) =>
        item.toLowerCase().includes(query.toLowerCase())
      ),
    [availableSymptoms, query]
  )

  const setPain = (value) => {
    const pain = Math.max(0, Math.min(10, Number(value)))

    setRecord((state) =>
      pain
        ? { ...state, pain }
        : {
            ...state,
            pain,
            painLocations: [],
            painTypes: [],
            otherPainLocation: '',
            otherPainType: '',
          }
    )
  }

  const commitOtherSymptom = async () => {
    if (!record.otherSymptom.trim() || !record.symptoms.includes('Other')) return

    try {
      const result = await addCustomSymptom(record.otherSymptom)

      setCustomSymptoms(result.customSymptoms)

      setRecord((state) => ({
        ...state,
        otherSymptom: '',
        symptoms: [
          ...state.symptoms.filter(
            (item) =>
              item !== 'Other' &&
              item.toLowerCase() !== result.symptom.toLowerCase()
          ),
          result.symptom,
        ],
      }))
    } catch (error) {
      showToast(error.message, 'error')
    }
  }

  const save = async () => {
  setSaving(true)

  try {
    await saveHealthLog(selectedDate, {
      ...record,
      moods: record.moods,
      mood: record.moods[0]?.toLowerCase() || null,
      sleep: record.sleep === '' ? null : Number(record.sleep),
      waterLiters:
        record.waterLiters === '' ? null : Number(record.waterLiters),
      water:
        record.waterLiters === ''
          ? null
          : Math.round(Number(record.waterLiters) / 0.25),

      periodStarted: record.periodStatus === 'period',
      periodStatus: record.periodStatus,
    })

    showToast('Check-In saved')
  } catch (error) {
    showToast(error.message, 'error')
  } finally {
    setSaving(false)
  }
}

  if (!record) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading your daily journal…
      </div>
    )
  }

  const waterAdd = (amount) => {
    const total =
      Math.round(((Number(record.waterLiters) || 0) + amount) * 1000) / 1000

    if (total > 10) {
      showToast('Water intake cannot exceed 10 L.', 'warning')
    }

    set('waterLiters', Math.min(total, 10))
  }

  const setWaterInput = (value) => {
    if (value === '') return set('waterLiters', '')

    const liters = Number(value)

    if (liters > 10) {
      showToast('Water intake cannot exceed 10 L.', 'warning')
    }

    set(
      'waterLiters',
      Math.min(Math.max(liters || 0, 0), 10)
    )
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 animate-fadeIn pb-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
          {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900 mt-1">
          Daily Health
        </h1>

        <p className="text-sm text-ink-500 mt-1">
          A quick check-in helps Saathi understand your wellbeing patterns.
        </p>
      </div>

      

      <Section
        title="Symptoms"
        description="Select anything you’re experiencing today."
        icon={HeartPulse}
      >
        {symptomsExpanded && (
          <Input
            label="Search symptoms"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search symptoms..."
            className="mb-3"
          />
        )}

        <Chips
          options={
            symptomsExpanded
              ? shownSymptoms
              : [
                  ...availableSymptoms.slice(0, 12),
                  ...record.symptoms.filter(
                    (item) => !availableSymptoms.slice(0, 12).includes(item)
                  ),
                ]
          }
          value={record.symptoms}
          onChange={(v) => set('symptoms', v)}
          label={
            symptomsExpanded
              ? 'All available symptoms'
              : 'Common symptoms'
          }
        />

        <button
          type="button"
          onClick={() => {
            setSymptomsExpanded((value) => !value)
            setQuery('')
          }}
          className="mt-3 text-sm font-semibold text-rose-600 hover:text-rose-700"
        >
          {symptomsExpanded ? 'View less' : 'View more'}
        </button>

        {record.symptoms.includes('Other') && (
          <Input
            label="Other symptom"
            value={record.otherSymptom}
            onChange={(event) => set('otherSymptom', event.target.value)}
            onBlur={commitOtherSymptom}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                commitOtherSymptom()
              }
            }}
            hint="Press Enter or click away to add it."
            className="mt-3"
            maxLength="120"
          />
        )}
      </Section>

      <Section
        title="Pain & Discomfort"
        description="Tell us where you feel pain and what it feels like."
      >
        <div className="flex justify-between text-sm font-semibold text-ink-700 mb-2">
          <span>Pain level</span>
          <span className="text-rose-600">{record.pain}/10</span>
        </div>

        <input
          type="range"
          min="0"
          max="10"
          value={record.pain}
          onChange={(e) => setPain(e.target.value)}
          className="w-full accent-rose-500"
          aria-label="Pain level, zero to ten"
        />

        <button
          type="button"
          onClick={() => setPain(0)}
          className={`mt-3 min-h-9 px-3 py-1.5 rounded-full border text-sm font-medium ${
            record.pain === 0
              ? 'bg-teal-500 text-white border-teal-500'
              : 'border-ink-100 text-ink-600'
          }`}
        >
          No pain
        </button>

        {record.pain > 0 && (
          <div className="grid sm:grid-cols-2 gap-5 mt-5">
            <div>
              <p className="text-sm font-semibold text-ink-700 mb-2">
                Location
              </p>

              <Chips
                options={lists.painLocations}
                value={record.painLocations}
                onChange={(v) => set('painLocations', v)}
                label="Pain locations"
              />

              <OtherInput
                when={record.painLocations.includes('Other')}
                label="Other location"
                value={record.otherPainLocation}
                onChange={(v) => set('otherPainLocation', v)}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-700 mb-2">
                Type
              </p>

              <Chips
                options={lists.painTypes}
                value={record.painTypes}
                onChange={(v) => set('painTypes', v)}
                label="Pain types"
              />

              <OtherInput
                when={record.painTypes.includes('Other')}
                label="Other pain type"
                value={record.otherPainType}
                onChange={(v) => set('otherPainType', v)}
              />
            </div>
          </div>
        )}
      </Section>

      <Section
        title="Mood"
        description="Select the moods that best describe your day."
      >
        <Chips
          options={moods.slice(0, 8)}
          value={record.moods}
          onChange={(v) => set('moods', v)}
          label="Common moods"
        />

        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-rose-600">
            More moods
          </summary>

          <div className="mt-3">
            <Chips
              options={moods.slice(8)}
              value={record.moods}
              onChange={(v) => set('moods', v)}
              label="More moods"
            />
          </div>
        </details>
      </Section>

      <Section title="Energy Level" icon={Activity}>
        <Single
          options={lists.energy}
          value={record.energy}
          onChange={(v) => set('energy', v)}
          label="Energy level"
        />

        <div className="mt-4">
          <Toggle
            checked={record.usualActivityLimited}
            onChange={(v) => set('usualActivityLimited', v)}
            label="Unable to do your usual activities"
          />
        </div>
      </Section>

      <Section title="Sleep" icon={Moon}>
        <div className="grid sm:grid-cols-2 gap-5">
          <Input
            label="Sleep duration"
            type="number"
            min="0"
            max="24"
            step="1"
            value={record.sleep}
            onChange={(e) => set('sleep', e.target.value)}
            placeholder="e.g. 7.5"
          />

          <div>
            <p className="text-sm font-semibold text-ink-700 mb-2">
              Sleep quality
            </p>

            <Single
              options={['Very poor', 'Poor', 'Okay', 'Good', 'Excellent']}
              value={record.sleepQuality}
              onChange={(v) => set('sleepQuality', v)}
              label="Sleep quality"
            />
          </div>
        </div>

        <p className="text-sm font-semibold text-ink-700 mt-5 mb-2">
          Sleep concerns
        </p>

        <Chips
          options={lists.sleepIssues}
          value={record.sleepIssues}
          onChange={(v) => set('sleepIssues', v)}
          none="None"
          label="Sleep concerns"
        />
      </Section>

      <Section title="Hydration" icon={Droplets}>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <Input
            label="Water intake"
            type="number"
            min="0"
            max="10"
            step=".05"
            value={record.waterLiters}
            onChange={(e) => setWaterInput(e.target.value)}
            placeholder="e.g. 1.8"
            hint="Maximum entry: 10 L."
          />

          <p className="text-sm text-ink-500 pb-2">
            {record.waterLiters === ''
              ? 'Enter your total intake for today.'
              : `${Math.round(Number(record.waterLiters) / 0.25)} glasses ≈ ${record.waterLiters} L`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {[
            [0.25, '250 ml'],
            [0.5, '500 ml'],
            [0.75, '750 ml'],
            [1, '1 L'],
          ].map(([amount, label]) => (
            <button
              type="button"
              key={label}
              onClick={() => waterAdd(amount)}
              className="min-h-9 px-3 rounded-full bg-teal-50 text-teal-700 text-sm font-medium"
            >
              + {label}
            </button>
          ))}
        </div>
      </Section>

      <Section
        title="Movement & Exercise"
        icon={Dumbbell}
        description="Track specific activities separately from your overall activity level."
      >
        <p className="text-sm font-semibold text-ink-700 mb-2">
          Activities
        </p>

        <Chips
          options={lists.exerciseActivities.slice(0, 7)}
          value={
            record.exerciseActivities.length
              ? record.exerciseActivities
              : array(record.exercise)
          }
          onChange={(v) => set('exerciseActivities', v)}
          none="None"
          label="Common exercise activities"
        />

        <details className="mt-3">
          <summary className="cursor-pointer text-sm font-semibold text-rose-600">
            More activities
          </summary>

          <div className="mt-3">
            <Chips
              options={lists.exerciseActivities.slice(7)}
              value={record.exerciseActivities}
              onChange={(v) => set('exerciseActivities', v)}
              none="None"
              label="More exercise activities"
            />
          </div>
        </details>

        <OtherInput
          when={record.exerciseActivities.includes('Other')}
          label="Other exercise"
          value={record.otherExercise}
          onChange={(v) => set('otherExercise', v)}
        />

        <div className="grid sm:grid-cols-2 gap-5 mt-5">
          <div>
            <p className="text-sm font-semibold text-ink-700 mb-2">
              Intensity
            </p>

            <Single
              options={['Very light', 'Light', 'Moderate', 'Hard', 'Very hard']}
              value={record.exerciseIntensity}
              onChange={(v) => set('exerciseIntensity', v)}
              label="Exercise intensity"
            />
          </div>

          <Input
            label="Duration"
            type="number"
            min="0"
            max="1440"
            value={record.exerciseMinutes}
            onChange={(e) => set('exerciseMinutes', e.target.value)}
            placeholder="e.g. 30"
            hint="<15, 15–30, 30–60, or 60+ min"
          />
        </div>
      </Section>

      <Section title="Meals & Nutrition" icon={Utensils}>
        <p className="text-sm font-semibold text-ink-700 mb-2">
          Meals today
        </p>

        <Chips
          options={lists.meals}
          value={record.meals.length ? record.meals : array(record.diet)}
          onChange={(v) => set('meals', v)}
          label="Meal patterns"
        />

        <OtherInput
          when={record.meals.includes('Other')}
          label="Other meal or food"
          value={record.otherMeal}
          onChange={(v) => set('otherMeal', v)}
        />

        <p className="text-sm font-semibold text-ink-700 mt-5 mb-2">
          Appetite
        </p>

        <Single
          options={['Very low', 'Low', 'Normal', 'High', 'Very high']}
          value={record.appetite}
          onChange={(v) => set('appetite', v)}
          label="Appetite"
        />

        <p className="text-sm font-semibold text-ink-700 mt-5 mb-2">
          Cravings
        </p>

        <Chips
          options={lists.cravings}
          value={record.cravings}
          onChange={(v) => set('cravings', v)}
          none="None"
          label="Cravings"
        />

        <OtherInput
          when={record.cravings.includes('Other')}
          label="Other craving"
          value={record.otherCraving}
          onChange={(v) => set('otherCraving', v)}
        />
      </Section>

      <Section title="Daily Wellbeing">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <p className="text-sm font-semibold text-ink-700 mb-2">
              Activity level
            </p>

            <Single
              options={[
                'Mostly resting',
                'Low activity',
                'Normal',
                'Active',
                'Very active',
              ]}
              value={record.activity}
              onChange={(v) => set('activity', v)}
              label="Activity level"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-700 mb-2">
              Stress level
            </p>

            <Single
              options={['Very low', 'Low', 'Moderate', 'High', 'Very high']}
              value={record.stress}
              onChange={(v) => set('stress', v)}
              label="Stress"
            />
          </div>
        </div>

        <p className="text-sm font-semibold text-ink-700 mt-5 mb-2">
          Mental wellbeing
        </p>

        <Chips
          options={lists.wellbeing}
          value={record.mentalWellbeing}
          onChange={(v) => set('mentalWellbeing', v)}
          label="Mental wellbeing"
        />

        <p className="text-sm font-semibold text-ink-700 mt-5 mb-2">
          Concentration
        </p>

        <Single
          options={['Poor', 'Okay', 'Good', 'Excellent']}
          value={record.concentration}
          onChange={(v) => set('concentration', v)}
          label="Concentration"
        />
      </Section>

      {/* Personal Note - always visible */}
<Section title="Personal Note">
  <label
    htmlFor="daily-notes"
    className="block text-sm font-semibold text-ink-700 mb-1.5"
  >
    Anything else you'd like Saathi to know?
  </label>

  <textarea
    id="daily-notes"
    value={record.notes}
    onChange={(e) => set('notes', e.target.value)}
    placeholder="Write a note..."
    maxLength="2000"
    rows="4"
    className="w-full rounded-xl border border-ink-100 bg-white px-4 py-2.5 text-sm text-ink-800 placeholder:text-ink-300 focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-400"
  />
</Section>

{/* Period & Bleeding - always visible */}
<Section
  title="Period & Bleeding"
  description="Tell Saathi if you're experiencing bleeding today."
>
  <p className="text-sm font-semibold text-ink-700 mb-2">
    Are you bleeding today?
  </p>

  <div className="flex flex-wrap gap-2">
    {[
      ['none', 'No bleeding'],
      ['spotting', 'Spotting'],
      ['period', 'Period'],
    ].map(([value, label]) => {
      const active = record.periodStatus === value

      return (
        <button
          key={value}
          type="button"
          onClick={() => {
            setRecord((state) => ({
              ...state,
              periodStatus: value,
              periodStarted: value === 'period',
            }))
          }}
          className={`min-h-9 px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
            active
              ? 'bg-rose-500 border-rose-500 text-white'
              : 'bg-white border-ink-100 text-ink-600 hover:border-rose-300'
          }`}
        >
          {label}
        </button>
      )
    })}
  </div>

  {/* Show menstrual details only when bleeding is reported */}
  {record.periodStatus !== 'none' && (
    <>
      {/* Bleeding level */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-ink-700 mb-2">
          Bleeding level
        </p>

        <Single
          options={
            record.periodStatus === 'spotting'
              ? ['Spotting', 'Light']
              : ['Light', 'Moderate', 'Heavy', 'Very heavy']
          }
          value={record.bleeding}
          onChange={(v) => set('bleeding', v)}
          label="Bleeding level"
        />
      </div>

      {/* Flow comparison - only for actual period */}
      {record.periodStatus === 'period' && (
        <div className="mt-5">
          <p className="text-sm font-semibold text-ink-700 mb-2">
            Flow compared with usual
          </p>

          <Single
            options={[
              'Lighter than usual',
              'About usual',
              'Heavier than usual',
            ]}
            value={record.flowChange}
            onChange={(v) => set('flowChange', v)}
            label="Flow compared with usual"
          />
        </div>
      )}

      {/* Products */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-ink-700 mb-2">
          Products used today
        </p>

        <Chips
          options={[
            'Pad',
            'Tampon',
            'Menstrual cup',
            'Period underwear',
            'Heating patch',
            'Other',
          ]}
          value={record.productOptions}
          onChange={(v) => set('productOptions', v)}
          label="Products used"
        />

        <OtherInput
          when={record.productOptions.includes('Other')}
          label="Other product"
          value={record.otherProduct}
          onChange={(v) => set('otherProduct', v)}
        />
      </div>

      {/* Relief */}
      <div className="mt-5">
        <p className="text-sm font-semibold text-ink-700 mb-2">
          Relief methods used
        </p>

        <Chips
          options={lists.relief}
          value={record.relief}
          onChange={(v) => set('relief', v)}
          none="None"
          label="Relief methods used"
        />

        <OtherInput
          when={record.relief.includes('Other')}
          label="Other relief"
          value={record.otherRelief}
          onChange={(v) => set('otherRelief', v)}
        />
      </div>
    </>
  )}
</Section>

<Button
  size="lg"
  icon={Save}
  onClick={save}
  disabled={saving}
  fullWidth
>
  {saving ? 'Saving…' : 'Save Check-In'}
</Button>  
    </div>
  )
}