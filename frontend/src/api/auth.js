import { api } from './client.js'

// Авторизация — раздел «Авторизация» в docs/API.md

export function login(email, password) {
  return api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
}

// name необязательное: без имени не передаём
export function register({ email, password, name }) {
  const body = { email, password }
  if (name) body.name = name
  return api('/auth/register', { method: 'POST', body: JSON.stringify(body) })
}

// Ответ всегда 204, есть такой email или нет; чаще раза в минуту письмо не уходит
export function requestPasswordReset(email) {
  return api('/auth/password-reset/request', { method: 'POST', body: JSON.stringify({ email }) })
}

export function confirmPasswordReset(token, password) {
  return api('/auth/password-reset/confirm', { method: 'POST', body: JSON.stringify({ token, password }) })
}
