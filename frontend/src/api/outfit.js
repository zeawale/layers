import { api } from './client.js'

// Рекомендации, оценки и история — разделы «Рекомендации» и «Оценки и история» в docs/API.md

// Комплект на сегодня — объект OutfitDay
export function getToday() {
  return api('/outfit/today')
}

// from, to — даты YYYY-MM-DD; без них бэк отдаёт последние 30 дней
export function getHistory({ from, to } = {}) {
  const params = new URLSearchParams()
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const query = params.toString()
  return api(`/outfit/history${query ? `?${query}` : ''}`)
}
