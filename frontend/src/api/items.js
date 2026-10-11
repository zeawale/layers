import { api } from './client.js'

// Гардероб — раздел «Гардероб» в docs/API.md

export function listItems() {
  return api('/items')
}
