import { api } from './client.js'

// Профиль — раздел «Профиль» в docs/API.md

export function getMe() {
  return api('/users/me')
}
