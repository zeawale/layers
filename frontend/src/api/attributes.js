import { api } from './client.js'

// Справочник атрибутов — раздел «Справочники» в docs/API.md

export function getAttributes() {
  return api('/attributes')
}
