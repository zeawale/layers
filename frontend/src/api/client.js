const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const TOKEN_KEY = 'layers_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
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
    throw new Error(detail ?? `HTTP ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}
