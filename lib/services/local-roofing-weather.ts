
const API_BASE = 'https://api.openweathermap.org/data/2.5'

interface OpenWeatherCondition {
  main: string
  description: string
}

interface CurrentWeatherResponse {
  name: string
  dt: number
  timezone: number
  main: {
    temp: number
    humidity: number
  }
  weather: OpenWeatherCondition[]
  wind?: {
    speed: number
  }
  rain?: {
    '1h'?: number
  }
  snow?: {
    '1h'?: number
  }
}

interface ForecastItem {
  dt: number
  main: {
    temp_min: number
    temp_max: number
  }
  weather: OpenWeatherCondition[]
  rain?: {
    '3h'?: number
  }
  snow?: {
    '3h'?: number
  }
  pop?: number
}

interface ForecastResponse {
  list: ForecastItem[]
}

export interface LocalRoofingWeatherData {
  city: string
  temperatureC: number
  conditions: string
  humidity: number
  windSpeedKmh: number
  rainLastHourMm: number | null
  snowLastHourMm: number | null
  rainNext24HoursMm: number
  snowNext24HoursMm: number
  rainChancePercent: number
  forecastHighC: number
  forecastLowC: number
  updatedAt: string
}

async function fetchWeatherJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 1800 },
  })

  if (!response.ok) {
    throw new Error(`Weather provider returned HTTP ${response.status}`)
  }

  return response.json() as Promise<T>
}

export async function getLocalRoofingWeather(
  latitude: number,
  longitude: number,
): Promise<LocalRoofingWeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    console.warn('OPENWEATHER_API_KEY is not configured')
    return null
  }

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null
  }

  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    appid: apiKey,
    units: 'metric',
  })

  try {
    const [current, forecast] = await Promise.all([
      fetchWeatherJson<CurrentWeatherResponse>(
        `${API_BASE}/weather?${params}`,
      ),
      fetchWeatherJson<ForecastResponse>(
        `${API_BASE}/forecast?${params}`,
      ),
    ])

    const now = Math.floor(Date.now() / 1000)

    // Include forecast periods within the next 24 hours.
    const next24Hours = forecast.list.filter(
      (item) => item.dt > now && item.dt <= now + 24 * 60 * 60,
    )

    const sum = (values: Array<number | undefined>) =>
      values.reduce<number>((total, value) => total + (value ?? 0), 0)

    const rainNext24HoursMm = sum(
      next24Hours.map((item) => item.rain?.['3h']),
    )

    const snowNext24HoursMm = sum(
      next24Hours.map((item) => item.snow?.['3h']),
    )

    const rainChancePercent =
      next24Hours.length > 0
        ? Math.round(
            Math.max(...next24Hours.map((item) => item.pop ?? 0)) * 100,
          )
        : 0

    return {
      city: current.name,
      temperatureC: Math.round(current.main.temp),
      conditions: current.weather[0]?.description ?? 'Conditions unavailable',
      humidity: current.main.humidity,
      windSpeedKmh: Math.round((current.wind?.speed ?? 0) * 3.6),
      rainLastHourMm:
        current.rain?.['1h'] ?? (current.weather[0]?.main === 'Rain' ? null : 0),
      snowLastHourMm:
        current.snow?.['1h'] ?? (current.weather[0]?.main === 'Snow' ? null : 0),
      rainNext24HoursMm: Math.round(rainNext24HoursMm * 10) / 10,
      snowNext24HoursMm: Math.round(snowNext24HoursMm * 10) / 10,
      rainChancePercent,
      forecastHighC:
        next24Hours.length > 0
          ? Math.round(Math.max(...next24Hours.map((item) => item.main.temp_max)))
          : Math.round(current.main.temp),
      forecastLowC:
        next24Hours.length > 0
          ? Math.round(Math.min(...next24Hours.map((item) => item.main.temp_min)))
          : Math.round(current.main.temp),
      updatedAt: new Date(current.dt * 1000).toISOString(),
    }
  } catch (error) {
    console.error('Unable to fetch local roofing weather:', error)
    return null
  }
}
