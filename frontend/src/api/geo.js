import { api } from './client.js'

// Города — раздел «Города» в docs/API.md. Подсказки при вводе названия

export function searchCities(q) {
  return api(`/geo/cities?q=${encodeURIComponent(q)}`)
}
