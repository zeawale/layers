import { api } from './client.js'

// Фото — раздел «Фото» в docs/API.md. Один и тот же файл годится и для вещи, и для профиля

// Форматы, которые принимает POST /photos, — для accept у выбора файла. HEIC и HEIF — фото из галереи iPhone
export const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

const UPLOAD_ERRORS = {
  413: 'Фото больше 10 МБ — выбери поменьше',
  415: 'Подойдёт фото в JPEG, PNG, WebP или HEIC',
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
