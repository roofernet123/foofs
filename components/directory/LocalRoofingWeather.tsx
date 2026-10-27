// components/directory/LocalRoofingWeather.tsx
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
} from 'lucide-react'

import { getLocalRoofingWeather } from '@/lib/services/local-roofing-weather'
import { getClimateData } from '@/lib/services/weather'

interface LocalRoofingWeatherProps {
  city: string
  state: string
  latitude: number | null
  longitude: number | null
}

// ---------- units (the directory is US-only, so show US units) ----------
const toF = (c: number) => Math.round((c * 9) / 5 + 32)
const toMph = (kmh: number) => Math.round(kmh * 0.621371)
const toInches = (mm: number) => {
  const inches = mm / 25.4
  if (inches <= 0) return '0 in'
  if (inches < 0.01) return '<0.01 in'
  return `${inches.toFixed(2)} in`
}
const num = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null
const joinAnd = (items: string[]) =>
  items.length < 3
    ? items.join(' and ')
    : `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`

// ---------- "can roofers work in this forecast?" ----------
export interface WorkWindowInput {
  forecastLowC: number
  forecastHighC: number
  rainNext24HoursMm: number
  rainChancePercent: number
  windSpeedKmh: number
  snowNext24HoursMm: number
}

export type WorkLevel = 'good' | 'caution' | 'poor'

export interface WorkAssessment {
  level: WorkLevel
  headline: string
  reasons: string[]
}

// Simple, transparent rules. These are scheduling hints, not safety guarantees.
export function assessWorkConditions(w: WorkWindowInput): WorkAssessment {
  const mph = toMph(w.windSpeedKmh)
  const lowF = toF(w.forecastLowC)
  const highF = toF(w.forecastHighC)

  const poor: string[] = []
  const caution: string[] = []

  if (w.snowNext24HoursMm > 0) {
    poor.push('Snow is in the forecast, which leaves roofs wet or icy and unsafe to work on.')
  }

  if (w.rainChancePercent >= 60 || w.rainNext24HoursMm >= 3) {
    poor.push(
      `Rain is likely (${w.rainChancePercent}% chance), so open-roof work is usually postponed.`
    )
  } else if (w.rainChancePercent >= 30 || w.rainNext24HoursMm >= 0.5) {
    caution.push(
      `There is a ${w.rainChancePercent}% chance of rain, so an exposed roof may need to be covered or the job rescheduled.`
    )
  }

  if (mph >= 25) {
    poor.push(`Winds around ${mph} mph make working at height and handling materials unsafe.`)
  } else if (mph >= 15) {
    caution.push(`It is breezy at about ${mph} mph, so loose materials need extra care.`)
  }

  if (highF < 40) {
    caution.push(
      `Highs stay below about 40°F, when asphalt shingles may not seal well. Roofers often delay or use cold-weather methods.`
    )
  } else if (lowF <= 32) {
    caution.push('Overnight frost can leave roof surfaces slippery early in the day.')
  }

  if (highF >= 90) {
    caution.push(
      `Highs near ${highF}°F make roofs hot and hard on crews, so work often starts early.`
    )
  }

  if (poor.length) {
    return {
      level: 'poor',
      headline: 'Weather is likely to delay roof work in the next 24 hours',
      reasons: [...poor, ...caution].slice(0, 3),
    }
  }

  if (caution.length) {
    return {
      level: 'caution',
      headline: 'Roof work is possible in the next 24 hours, with some weather to watch',
      reasons: caution.slice(0, 3),
    }
  }

  return {
    level: 'good',
    headline: 'Conditions look good for roof work in the next 24 hours',
    reasons: ['No rain, snow, strong wind or temperature extremes in the forecast.'],
  }
}

// ---------- long-term climate notes ----------
export interface ClimateLike {
  annualRainfall?: number
  annualSnowfall?: number
  averageHighTemp?: number
  averageLowTemp?: number
  bestMonths?: string[]
  worstMonths?: string[]
}

export function buildClimateNotes(place: string, climate: ClimateLike | null) {
  if (!climate) return { summary: null as string | null, notes: [] as string[] }

  const rain = num(climate.annualRainfall)
  const snow = num(climate.annualSnowfall)
  const hi = num(climate.averageHighTemp)
  const lo = num(climate.averageLowTemp)
  const best = (climate.bestMonths ?? []).filter((m) => typeof m === 'string' && m.trim())
  const worst = (climate.worstMonths ?? []).filter((m) => typeof m === 'string' && m.trim())

  const bits: string[] = []
  if (rain !== null && rain > 0) bits.push(`about ${Math.round(rain)} inches of rain`)
  if (snow !== null && snow >= 1) bits.push(`about ${Math.round(snow)} inches of snow`)

  let summary: string | null = null
  if (bits.length) summary = `In a typical year ${place} receives ${joinAnd(bits)}`
  if (hi !== null && lo !== null) {
    summary = `${summary ? `${summary}, with` : `${place} has`} average highs near ${Math.round(hi)}°F and lows near ${Math.round(lo)}°F`
  }
  if (summary) summary += '.'

  const notes: string[] = []
  if (best.length) notes.push(`Best months for roof work: ${best.join(', ')}.`)
  if (worst.length) notes.push(`Expect more weather delays in ${joinAnd(worst)}.`)
  if (snow !== null && snow >= 10) {
    notes.push(
      'Snow load and ice dams are real concerns here, so ask any contractor about insulation, ventilation and snow-ready materials.'
    )
  }
  if (rain !== null && rain > 45) {
    notes.push('Heavy annual rainfall makes flashing, drainage and waterproofing details especially important.')
  }
  if (hi !== null && hi > 80) {
    notes.push('Hot summers make attic ventilation and reflective "cool roof" materials worth asking about.')
  }

  return { summary, notes: notes.slice(0, 4) }
}

const LEVEL_STYLES: Record<WorkLevel, { box: string; icon: string }> = {
  good: { box: 'border-green-200 bg-green-50 text-green-900', icon: 'text-green-600' },
  caution: { box: 'border-amber-200 bg-amber-50 text-amber-900', icon: 'text-amber-600' },
  poor: { box: 'border-red-200 bg-red-50 text-red-900', icon: 'text-red-600' },
}

export async function LocalRoofingWeather({
  city,
  state,
  latitude,
  longitude,
}: LocalRoofingWeatherProps) {
  // Live forecast is optional: an API failure must never break the profile or hide the climate guidance.
  let weather: Awaited<ReturnType<typeof getLocalRoofingWeather>> | null = null
  if (
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude)
  ) {
    try {
      weather = await getLocalRoofingWeather(latitude, longitude)
    } catch {
      weather = null
    }
  }

  const place = city || weather?.city || state
  const climate = getClimateData(city, state) as unknown as ClimateLike | null
  const { summary, notes } = buildClimateNotes(place, climate)

  if (!weather && !summary && notes.length === 0) return null

  const assessment = weather ? assessWorkConditions(weather) : null
  const style = assessment ? LEVEL_STYLES[assessment.level] : null
  const LevelIcon = assessment?.level === 'good' ? CheckCircle2 : AlertTriangle

  return (
    <section
      aria-labelledby="local-roofing-weather-title"
      className="mt-6 rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-sky-50 p-3">
          <CloudSun className="h-6 w-6 text-sky-700" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="local-roofing-weather-title" className="text-xl font-bold text-gray-900">
            Roofing weather in {place}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            What the forecast and the local climate mean for scheduling roof work.
          </p>
        </div>
      </div>

      {weather && assessment && style && (
        <div className="mt-5">
          <div className={`rounded-lg border p-4 ${style.box}`}>
            <div className="flex items-start gap-3">
              <LevelIcon className={`mt-0.5 h-5 w-5 shrink-0 ${style.icon}`} />
              <div className="min-w-0">
                <p className="font-semibold">{assessment.headline}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {assessment.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs capitalize text-gray-500">
            Right now: {weather.conditions}
          </p>

          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <WeatherMetric
              icon={<Thermometer className="h-4 w-4" />}
              label="Temperature"
              value={`${toF(weather.temperatureC)}°F`}
              sub={`High ${toF(weather.forecastHighC)}° / Low ${toF(weather.forecastLowC)}°`}
            />
            <WeatherMetric
              icon={<Droplets className="h-4 w-4" />}
              label="Rain chance"
              value={`${weather.rainChancePercent}%`}
            />
            <WeatherMetric
              icon={<CloudRain className="h-4 w-4" />}
              label="Expected rain"
              value={toInches(weather.rainNext24HoursMm)}
            />
            <WeatherMetric
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${toMph(weather.windSpeedKmh)} mph`}
            />
          </div>
        </div>
      )}

      {(summary || notes.length > 0) && (
        <div className={weather ? 'mt-6 border-t border-gray-100 pt-5' : 'mt-5'}>
          <h3 className="font-semibold text-gray-900">Roofing through the year in {place}</h3>

          {summary && <p className="mt-2 text-sm leading-relaxed text-gray-600">{summary}</p>}

          {notes.length > 0 && (
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-gray-600">
              {notes.map((note) => (
                <li key={note} className="flex gap-2">
                  <span aria-hidden="true" className="text-sky-600">
                    •
                  </span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        {weather ? 'Forecast data from OpenWeather, refreshed about hourly. ' : ''}
        Climate figures are long-term averages and can differ by neighborhood. Weather can change
        quickly and none of this guarantees safe working conditions, so confirm scheduling with
        your contractor.
      </p>
    </section>
  )
}

function WeatherMetric({
  icon,
  label,
  value,
  sub,
}: {
  icon: ReactNode
  label: string
  value: string
  sub?: string
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-sky-700">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>

      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
    </div>
  )
}