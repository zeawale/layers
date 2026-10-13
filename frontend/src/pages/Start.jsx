import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { getToken } from '../api/client.js'
import { getMe } from '../api/users.js'
import { LoadError } from '../components/LoadState.jsx'
import NoConnection from '../components/NoConnection.jsx'
import Splash from './start/Splash.jsx'

const TAGLINE = 'гардероб, который знает погоду'
const PAUSE_MS = 900 // сколько видна заставка: полоска успевает доехать

// Точка входа на «/» — заставка (1.0), пока решаем, куда отправить человека.
// Нет токена → приветствие (1.1). Есть → профиль: «С возвращением, Саша» (1.0r), затем онбординг или «Сегодня»
export default function Start() {
  const navigate = useNavigate()
  const hasToken = Boolean(getToken())
  const [progress, setProgress] = useState(0)
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    // Полоска стартует с края (1.0a) и едет к середине, пока ждём ответ.
    // Ответ мог прийти раньше — тогда полоска уже на 100 и назад не едет
    const id = setTimeout(() => setProgress((p) => Math.max(p, 66)), 50)
    if (!hasToken) {
      const go = setTimeout(() => navigate('/welcome', { replace: true }), PAUSE_MS)
      return () => { clearTimeout(id); clearTimeout(go) }
    }
    setError(null)
    // Ушли с заставки (или эффект перезапустился) — поздний ответ getMe никуда не ведёт
    let alive = true
    let go
    getMe()
      .then((u) => {
        if (!alive) return
        setUser(u)
        setProgress(100)
        go = setTimeout(() => navigate(u.onboarding_completed ? '/today' : '/onboarding', { replace: true }), PAUSE_MS)
      })
      .catch((err) => {
        if (alive) setError(err)
      })
    return () => { alive = false; clearTimeout(id); clearTimeout(go) }
  }, [hasToken, attempt, navigate])

  const retry = () => setAttempt((n) => n + 1)
  if (error?.offline) return <NoConnection onRetry={retry} />
  // Сессия истекла — api/client.js уже ведёт на вход, ошибку не показываем
  if (error && !error.expired) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <LoadError message={error.message} onRetry={retry} />
      </Box>
    )
  }

  // С токеном, пока ждём профиль, подпись пустая (место держит Splash), чтобы слоган не сменился приветствием.
  // Имя необязательное — без него просто «С возвращением»
  let line = TAGLINE
  if (hasToken) line = user ? `С возвращением${user.name ? `, ${user.name}` : ''}` : ''
  return <Splash line={line} progress={progress} />
}
