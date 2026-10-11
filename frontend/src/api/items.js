import { api } from './client.js'

// Гардероб — раздел «Гардероб» в docs/API.md

export function listItems() {
  return api('/items')
}

export function createItem(item) {
  return api('/items', { method: 'POST', body: JSON.stringify(item) })
}

// Только предзаполняет форму, вещь не сохраняет (раздел «Распознавание фото»)
export function recognizeItem(photoId) {
  return api('/items/recognize', { method: 'POST', body: JSON.stringify({ photo_id: photoId }) })
}
