import { api } from './client.js'

// Фото — раздел «Фото» в docs/API.md. Один и тот же файл годится и для вещи, и для профиля

const UPLOAD_ERRORS = {
  413: 'Фото больше 10 МБ — выберите поменьше',
  415: 'Подойдёт фото в JPEG, PNG или WebP',
}

export async function uploadPhoto(file) {
  const body = new FormData()
  body.append('file', file)
  try {
    return await api('/photos', { method: 'POST', body })
  } catch (err) {
    if (UPLOAD_ERRORS[err.status]) err.message = UPLOAD_ERRORS[err.status]
    throw err
  }
}
