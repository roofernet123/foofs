
import {
  CloudRain,
  CloudSnow,
  Thermometer,
  Wind,
  Droplets,
  CloudSun,
} from 'lucide-react'

import { getLocalRoofingWeather } from '@/lib/services/local-roofing-weather'
import {
  getClimateData,
  getRoofingAdvice,
} from '@/lib/services/weather'

interface LocalRoofingWeatherProps {
  city: string
  state: string
  latitude: number | null
  longitude: number | null
}

export async function LocalRoofingWeather({
  city,
  state,
  latitude,
  longitude,
}: LocalRoofingWeatherProps) {
  if (
    latitude === null ||
    longitude === null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null
  }

  const weather = await getLocalRoofingWeather(latitude, longitude)

  if (!weather) {
    // Weather is supplementary; never let an API failure
    // prevent the contractor profile from rendering.
    return null
  }

  const climate = getClimateData(city, state)
  const advice = getRoofingAdvice(climate).slice(0, 3)

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
          <h2
            id="local-roofing-weather-title"
            className="text-xl font-bold text-gray-900"
          >
            Roofing weather in {city || weather.city}
          </h2>

          <p className="mt-1 text-sm capitalize text-gray-600">
            {weather.conditions}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Current conditions and a 24-hour forecast
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-gray-900">
            {weather.temperatureC}°C
          </p>
          <p className="text-xs text-gray-500">
            {weather.forecastLowC}°–{weather.forecastHighC}°C
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <WeatherMetric
          icon={<CloudRain className="h-4 w-4" />}
          label="Rain forecast"
          value={`${weather.rainNext24HoursMm} mm`}
        />

        <WeatherMetric
          icon={<Droplets className="h-4 w-4" />}
          label="Rain chance"
          value={`${weather.rainChancePercent}%`}
        />

        <WeatherMetric
          icon={<Wind className="h-4 w-4" />}
          label="Wind"
          value={`${weather.windSpeedKmh} km/h`}
        />

        <WeatherMetric
          icon={<CloudSnow className="h-4 w-4" />}
          label="Snow forecast"
          value={`${weather.snowNext24HoursMm} mm`}
        />
      </div>

      {advice.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <h3 className="font-semibold text-gray-900">
            Roofing considerations
          </h3>

          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-gray-600">
            {advice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs leading-relaxed text-gray-500">
        Weather data provided by OpenWeather. Forecasts can change and
        should not be treated as a guarantee of safe working conditions.
        Confirm local conditions before scheduling roofing work.
      </p>

      <p className="mt-1 text-xs text-gray-400">
        Weather observation: {new Date(weather.updatedAt).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'UTC',
        })} UTC
      </p>
    </section>
  )
}

function WeatherMetric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-center gap-2 text-sky-700">
        {icon}
        <span className="text-xs text-gray-600">{label}</span>
      </div>

      <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
    </div>
  )
}
