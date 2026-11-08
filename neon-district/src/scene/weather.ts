export type WeatherSettings = { rain: number; smoke: number; wetness: number };
export const DEFAULT_WEATHER: WeatherSettings = { rain: 55, smoke: 75, wetness: 90 };
export const clampPercent = (value: number) => Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
export function getWeatherRates(rain: number, smoke: number, low: boolean, reducedMotion: boolean) {
  const r = clampPercent(rain) / 100, s = clampPercent(smoke) / 100;
  return {
    rain: reducedMotion ? 0 : Math.round((low ? 2600 : 6500) * r * r),
    splashes: reducedMotion ? 0 : Math.round((low ? 70 : 200) * r * r),
    smoke: reducedMotion ? 0 : (low ? 4.5 : 7.5) * s,
    rainSpeed: 14 + 12 * r,
  };
}
export function readWeather(): WeatherSettings {
  try {
    const data = JSON.parse(localStorage.getItem('yoru.weather.v1') ?? 'null');
    return data && typeof data === 'object' ? {
      rain: typeof data.rain === 'number' ? clampPercent(data.rain) : DEFAULT_WEATHER.rain,
      smoke: typeof data.smoke === 'number' ? clampPercent(data.smoke) : DEFAULT_WEATHER.smoke,
      wetness: typeof data.wetness === 'number' ? clampPercent(data.wetness) : DEFAULT_WEATHER.wetness,
    } : { ...DEFAULT_WEATHER };
  } catch { return { ...DEFAULT_WEATHER }; }
}
