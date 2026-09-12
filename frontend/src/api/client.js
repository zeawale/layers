// Единственное место, где знаем адрес бэкенда и формат ошибок.
// Компоненты вызывают api('/wardrobe'), а не пишут fetch руками.

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export async function api(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    // FastAPI кладёт текст ошибки в поле detail
    const body = await response.json().catch(() => ({}))
    throw new Error(body.detail ?? `HTTP ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}
