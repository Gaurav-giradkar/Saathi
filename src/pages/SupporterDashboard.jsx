import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  Heart,
  Droplets,
  CalendarClock,
  ThermometerSun,
  Smile,
  HandHeart,
  ShieldAlert,
  ArrowRight,
  Users,
  RefreshCw,
  AlertCircle,
  Zap,
  Moon,
  Activity,
  Utensils,
  ClipboardList,
} from 'lucide-react'

import Card from '../components/common/Card.jsx'
import StatCard from '../components/common/StatCard.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import PhaseBadge from '../components/common/PhaseBadge.jsx'

import { getSupporterData } from '../data/api.js'
import { MOOD_OPTIONS, PHASES } from '../data/mockData.js'

function formatDate(iso) {
  if (!iso) return 'Not available'

  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    })
  } catch {
    return iso
  }
}

function DetailCard({ label, value }) {
  if (
    value == null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return null
  }

  return (
    <div className="rounded-xl bg-white border border-ink-100 p-4">
      <p className="text-[11px] uppercase tracking-wide font-semibold text-ink-600">
        {label}
      </p>

      <p className="text-sm text-ink-800 mt-1 leading-relaxed">
        {Array.isArray(value)
          ? value.join(', ')
          : value}
      </p>
    </div>
  )
}

export default function SupporterDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setFetchError(null)

      const result = await getSupporterData()

      setData(result)
    } catch (error) {
      setFetchError(
        error?.message ||
          'Failed to load supporter dashboard.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse text-ink-400 text-sm py-20 text-center">
        Loading dashboard…
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="text-center py-20 flex flex-col items-center gap-3">
        <AlertCircle
          size={36}
          className="text-rose-500"
        />

        <p className="text-rose-600 font-medium">
          Could not load dashboard
        </p>

        <p className="text-ink-500 text-sm max-w-sm">
          {fetchError}
        </p>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          onClick={loadData}
        >
          Retry
        </Button>
      </div>
    )
  }

  const connStatus =
    data?.connection?.status

  // ============================================================
  // NO CONNECTION
  // ============================================================

  if (
    !connStatus ||
    connStatus === 'none'
  ) {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Supporter Dashboard
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            Welcome to Saathi. Connect with the
            person you're supporting to get started.
          </p>
        </div>

        <Card className="!py-12">
          <EmptyState
            icon={Users}
            title="You're not connected yet."
            description="Ask the person you're supporting for their invitation code."
            action={
              <Button
                as={Link}
                to="/supporter/connection"
                icon={ArrowRight}
                iconPosition="right"
                variant="teal"
              >
                Connect
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // ============================================================
  // PENDING
  // ============================================================

  if (connStatus === 'pending') {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Supporter Dashboard
          </h1>

          <p className="text-ink-500 text-sm mt-1">
            Connection in progress.
          </p>
        </div>

        <Card className="!py-12">
          <EmptyState
            icon={Users}
            title="Connection request pending."
            description="Waiting for the owner to approve your request."
            action={
              <Button
                as={Link}
                to="/supporter/connection"
                icon={ArrowRight}
                iconPosition="right"
                variant="teal"
              >
                View connection
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  // ============================================================
  // ACTIVE
  // ============================================================

  const shared =
    data?.shared || {}

  const permissions =
    data?.permissions ||
    shared?.permissions ||
    {}

  const suggestion =
    data?.suggestion || {
      feeling:
        'Their period is not currently active.',
      help: [],
      avoid: [],
    }

  const moodValue =
    Array.isArray(shared.mood)
      ? shared.mood[0]
      : shared.mood

  const moodMeta =
    moodValue
      ? MOOD_OPTIONS.find(
          (item) =>
            item.key?.toLowerCase() ===
            String(moodValue).toLowerCase(),
        )
      : null

  const phaseKey =
    shared.cyclePhase
      ? Object.keys(PHASES).find(
          (key) =>
            PHASES[key].label
              ?.toLowerCase() ===
            String(
              shared.cyclePhase,
            ).toLowerCase(),
        )
      : null

  const diet =
    shared.dietNutrition || {}

  const sleep =
    shared.sleep || {}

  const medical =
    shared.medicalInfo || {}

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">

      {/* HEADER */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
          Hello 👋
        </h1>

        <p className="text-ink-500 text-sm mt-1">
          Connected to{' '}
          <span className="font-semibold text-ink-800">
            {data.connectedUserName}
          </span>
        </p>
      </div>

      {/* CONNECTION */}
      <Card className="flex items-center gap-4 !py-4 sm:!py-5">
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-display font-bold text-xl shrink-0">
          {data.connectedUserName?.[0]?.toUpperCase() ||
            'C'}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-ink-900 text-base sm:text-lg truncate">
            {data.connectedUserName}
          </p>

          <p className="text-xs sm:text-sm text-ink-500">
            Sharing selected updates with you
          </p>
        </div>

        {phaseKey && (
          <PhaseBadge phaseKey={phaseKey} />
        )}
      </Card>

      {/* ========================================================
          BASIC SHARED INFORMATION
      ======================================================== */}

      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Heart
              size={20}
              className="text-teal-600"
            />
          </div>

          <div>
            <h2 className="font-display font-semibold text-ink-900 text-lg">
              Shared health information
            </h2>

            <p className="text-sm text-ink-500">
              Only information explicitly shared with you is shown.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">

          {/* Cycle phase */}
          {permissions.cyclePhase && (
            <DetailCard
              label="Cycle phase"
              value={
                shared.cyclePhase ||
                'Not available'
              }
            />
          )}

          {/* Period status */}
          {permissions.periodStatus && (
            <DetailCard
              label="Period status"
              value={
                shared.periodStatus ||
                'Not logged today'
              }
            />
          )}

          {/* Expected period */}
          {permissions.expectedPeriod && (
            <DetailCard
              label="Expected period"
              value={
                shared.expectedPeriod
                  ? formatDate(
                      shared.expectedPeriod,
                    )
                  : 'Not available'
              }
            />
          )}

          {/* Pain */}
          {permissions.painLevel && (
            <DetailCard
              label="Pain level"
              value={
                shared.painLevel != null
                  ? `${shared.painLevel}/10`
                  : 'Not logged today'
              }
            />
          )}

          {/* Mood */}
          {permissions.mood && (
            <DetailCard
              label="Mood"
              value={
                moodMeta
                  ? `${moodMeta.emoji} ${moodMeta.label}`
                  : moodValue ||
                    'Not logged today'
              }
            />
          )}

          {/* Energy */}
          {permissions.energy && (
            <DetailCard
              label="Energy"
              value={
                shared.energy ||
                'Not logged today'
              }
            />
          )}

        </div>
      </Card>

      {/* ========================================================
          SYMPTOMS
      ======================================================== */}

      {permissions.symptoms && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Activity
              size={18}
              className="text-teal-600"
            />

            <h2 className="font-display font-semibold text-ink-900">
              Symptoms
            </h2>
          </div>

          {shared.symptoms?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {shared.symptoms.map(
                (symptom, index) => (
                  <span
                    key={`${symptom}-${index}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200/60"
                  >
                    {symptom}
                  </span>
                ),
              )}
            </div>
          ) : (
            <p className="text-sm text-ink-500">
              No symptoms logged today.
            </p>
          )}
        </Card>
      )}

      {/* ========================================================
          DIET & NUTRITION
      ======================================================== */}

      {permissions.dietNutrition && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Utensils
              size={18}
              className="text-rose-500"
            />

            <h2 className="font-display font-semibold text-ink-900">
              Diet & nutrition
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">

            <DetailCard
              label="Meals"
              value={
                diet.meals?.length
                  ? diet.meals
                  : 'Not logged today'
              }
            />

            <DetailCard
              label="Appetite"
              value={
                diet.appetite ||
                'Not logged today'
              }
            />

            <DetailCard
              label="Cravings"
              value={
                diet.cravings?.length
                  ? diet.cravings
                  : 'None logged'
              }
            />

            <DetailCard
              label="Water intake"
              value={
                diet.waterLiters != null
                  ? `${diet.waterLiters} L`
                  : 'Not logged today'
              }
            />

          </div>
        </Card>
      )}

      {/* ========================================================
          SLEEP
      ======================================================== */}

      {permissions.sleep && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Moon
              size={18}
              className="text-purple-500"
            />

            <h2 className="font-display font-semibold text-ink-900">
              Sleep
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">

            <DetailCard
              label="Duration"
              value={
                sleep.duration != null
                  ? `${sleep.duration} hrs`
                  : 'Not logged today'
              }
            />

            <DetailCard
              label="Quality"
              value={
                sleep.quality ||
                'Not logged today'
              }
            />

            <div className="sm:col-span-2">
              <DetailCard
                label="Sleep issues"
                value={
                  sleep.issues?.length
                    ? sleep.issues
                    : 'None logged'
                }
              />
            </div>

          </div>
        </Card>
      )}

      {/* ========================================================
          MEDICAL INFORMATION
      ======================================================== */}

      {permissions.medicalInfo && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList
              size={18}
              className="text-rose-500"
            />

            <h2 className="font-display font-semibold text-ink-900">
              Medical information
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">

            <DetailCard
              label="Pain locations"
              value={
                medical.painLocations?.length
                  ? medical.painLocations
                  : 'None logged'
              }
            />

            <DetailCard
              label="Pain types"
              value={
                medical.painTypes?.length
                  ? medical.painTypes
                  : 'None logged'
              }
            />

            <DetailCard
              label="Relief methods"
              value={
                medical.relief?.length
                  ? medical.relief
                  : 'None logged'
              }
            />

            <div className="sm:col-span-2">
              <DetailCard
                label="Notes"
                value={
                  medical.notes ||
                  'No notes shared'
                }
              />
            </div>

          </div>
        </Card>
      )}

      {/* ========================================================
          HELP
      ======================================================== */}

      <Card className="bg-teal-50/60 border-teal-100">
        <div className="flex items-center gap-2 mb-4">
          <HandHeart
            size={20}
            className="text-teal-600"
          />

          <h2 className="font-display font-semibold text-ink-900 text-lg">
            How you can help today
          </h2>
        </div>

        {suggestion.feeling && (
          <p className="text-sm text-ink-700 font-medium mb-3 italic">
            "{suggestion.feeling}"
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">

          {suggestion.help?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                Try this
              </p>

              <ul className="flex flex-col gap-1.5">
                {suggestion.help.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-ink-700 flex gap-2"
                    >
                      <span className="text-teal-500">
                        •
                      </span>

                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

          {suggestion.avoid?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <ShieldAlert size={13} />
                Things to avoid
              </p>

              <ul className="flex flex-col gap-1.5">
                {suggestion.avoid.map(
                  (item, index) => (
                    <li
                      key={index}
                      className="text-sm text-ink-700 flex gap-2"
                    >
                      <span className="text-rose-400">
                        •
                      </span>

                      <span>{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}

        </div>

        <Link
          to="/supporter/wellness"
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800 mt-4"
        >
          Full guidance and care tips
          <ArrowRight size={14} />
        </Link>
      </Card>

      {/* PRIVACY */}
      <Card className="flex items-start gap-3">
        <Heart
          size={18}
          className="text-rose-400 mt-0.5 shrink-0"
        />

        <p className="text-sm text-ink-600 leading-relaxed">
          <span className="font-semibold text-ink-700">
            {data.connectedUserName}
          </span>{' '}
          controls exactly what's shared with you.
          Anything switched off remains private.
        </p>
      </Card>

    </div>
  )
}