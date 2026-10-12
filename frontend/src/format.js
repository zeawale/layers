// Форматирование чисел и дат для интерфейса — общее для главного экрана и истории

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
