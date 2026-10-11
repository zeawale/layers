// Общее форматирование для экранов: температура, погода, даты

// «+12°», «−3°», «0°»
export function formatTemp(t) {
  const n = Math.round(t)
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}°`
}

// Состояний погоды ровно четыре (API.md, Weather)
const CONDITION_LABEL = { clear: 'ясно', cloudy: 'облачно', rain: 'дождь', snow: 'снег' }

export function conditionLabel(condition) {
  return CONDITION_LABEL[condition] ?? condition
}

// Даты из API — «2026-09-25» без времени: разбираем как местную дату, а не UTC
function parseDay(date) {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// «Пятница, 25 сентября»
export function formatDayLong(date) {
  return capitalize(parseDay(date).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }))
}

// «Пт, 25 сентября»
export function formatDayShort(date) {
  return capitalize(parseDay(date).toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' }))
}
