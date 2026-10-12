import { api } from './client.js'

// Профиль — раздел «Профиль» в docs/API.md

export function getMe() {
  return api('/users/me')
}

// Передаём только то, что меняем. preferences заменяется целиком
export function updateMe(changes) {
  return api('/users/me', { method: 'PATCH', body: JSON.stringify(changes) })
}
