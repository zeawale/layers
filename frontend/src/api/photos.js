import { api } from './client.js'

// Фото — раздел «Фото» в docs/API.md. Поле формы — file

export function uploadPhoto(file) {
  const body = new FormData()
  body.append('file', file)
  return api('/photos', { method: 'POST', body })
}
