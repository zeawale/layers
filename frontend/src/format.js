// Форматирование чисел, дат и слов для интерфейса — общее для экранов

// Окончание по числу: plural(5, ['вещь', 'вещи', 'вещей']) → «вещей»
export function plural(n, [one, few, many]) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

// «4 990 ₽»: цена партнёрского товара, рубли целым числом
export function formatPrice(rubles) {
  return `${rubles.toLocaleString('ru-RU')} ₽`
}

// «+12°», «−3°», «0°»: настоящий минус, а не дефис
export function formatTemp(t) {
  const n = Math.round(t)
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}°`
}

// «суббота, 26 сентября» — заглавные делает вариант overline
export function formatDay(date = new Date()) {
  return date.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
}

// «Доброе утро, Саша»; без имени — просто «Доброе утро» (имя в профиле необязательное)
export function greeting(name, date = new Date()) {
  const h = date.getHours()
  const part = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 17 ? 'Добрый день' : h < 23 ? 'Добрый вечер' : 'Доброй ночи'
  return name ? `${part}, ${name}` : part
}

// Дата комплекта приходит строкой YYYY-MM-DD — разбираем как местный день, без сдвига по часовому поясу
const parseDay = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
const capital = (s) => s.charAt(0).toUpperCase() + s.slice(1)

// «Пт, 25 сентября» — строка истории (макет 4.0)
export function formatDayShort(iso) {
  const date = parseDay(iso)
  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' })
  return `${capital(weekday)}, ${date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}`
}

// «Пятница, 25 сентября» — заголовок дня в истории (макет 4.1)
export function formatDayLong(iso) {
  return capital(formatDay(parseDay(iso)))
}

// Погода словами: четыре значения condition из API.md (Weather), справочника для них нет
const CONDITION_TEXT = { clear: 'ясно', cloudy: 'облачно', rain: 'дождь', snow: 'снег' }
export const conditionText = (c) => CONDITION_TEXT[c] ?? ''
