import { api } from './client.js'

// Рекомендации и оценки — разделы «Рекомендации» и «Оценки и история» в docs/API.md.
// getToday, regenerate и selectVariant отвечают объектом OutfitDay — экран просто перерисовывается из ответа.

export function getToday() {
  return api('/outfit/today')
}

export function regenerate() {
  return api('/outfit/today/regenerate', { method: 'POST' })
}

export function selectVariant(id) {
  return api(`/outfit/${id}/select`, { method: 'POST' })
}

// { rating: 'like' | 'dislike' | null } и/или { worn: true | false }. Ответ — один Outfit
export function sendFeedback(id, changes) {
  return api(`/outfit/${id}/feedback`, { method: 'POST', body: JSON.stringify(changes) })
}
