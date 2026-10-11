const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'layers_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

// Фото бэк отдаёт относительным адресом (/media/...), базовый адрес знает только api/
export function mediaUrl(path) {
  return path ? `${BASE_URL}${path}` : null
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function api(path, options = {}) {
  const token = getToken()
  const headers = { ...options.headers }
  // Фото уходят как FormData: Content-Type с границей частей браузер ставит сам
  if (!(options.body instanceof FormData)) headers['Content-Type'] ??= 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // 401 на входе — неверный пароль, а не истёкшая сессия: его показываем на форме
  if (response.status === 401 && token && path !== '/auth/login') {
    setToken(null)
    window.location.href = '/login'
    throw new Error('Сессия истекла')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    // У 422 detail — список ошибок по полям, у остальных — строка
    const detail = Array.isArray(body.detail) ? body.detail.map((e) => e.msg).join('. ') : body.detail
    const error = new Error(detail ?? `HTTP ${response.status}`)
    error.status = response.status
    // 422: какое поле не прошло — { email: '…', password: '…' }. Экран показывает под полем свой текст по-русски
    if (Array.isArray(body.detail)) {
      error.fields = Object.fromEntries(body.detail.map((e) => [e.loc?.[e.loc.length - 1], e.msg]))
    }
    throw error
  }

  return response.status === 204 ? null : response.json()
}
