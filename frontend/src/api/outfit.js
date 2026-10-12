import { api } from './client.js'

// Рекомендации — раздел «Рекомендации» в docs/API.md. Ответ — объект OutfitDay

export function getToday() {
  return api('/outfit/today')
}
