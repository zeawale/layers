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

export function getItem(id) {
  return api(`/items/${id}`)
}

// Вещь удаляется вместе с фото; из прошлых комплектов она пропадает, сами дни остаются
export function deleteItem(id) {
  return api(`/items/${id}`, { method: 'DELETE' })
}

// Передаём только то, что меняем; photo_id: null отвязывает фото
export function updateItem(id, changes) {
  return api(`/items/${id}`, { method: 'PATCH', body: JSON.stringify(changes) })
}

// Всё или ничего: одна чужая или несуществующая — не удаляется ни одна
export function bulkDeleteItems(ids) {
  return api('/items/bulk-delete', { method: 'POST', body: JSON.stringify({ ids }) })
}
