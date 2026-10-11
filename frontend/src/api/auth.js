import { api } from './client.js'

// Авторизация — раздел «Авторизация» в docs/API.md

// Неверный текущий пароль — 400, а не 401, чтобы человека не выкинуло на вход.
// В ответе новый токен: старые после смены не работают
export function changePassword(currentPassword, newPassword) {
  return api('/auth/password/change', {
    method: 'POST',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  })
}
