import { api } from './client.js'

// Гардероб — раздел «Гардероб» в docs/API.md

export function listItems() {
  return api('/items')
}

export function createItem(item) {
  return api('/items', { method: 'POST', body: JSON.stringify(item) })
}
