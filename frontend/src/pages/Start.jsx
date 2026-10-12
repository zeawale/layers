import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button } from '@mui/material'

import { getToken } from '../api/client.js'
import { getMe } from '../api/users.js'
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
    // Полоска стартует с края (1.0a) и едет к середине, пока ждём ответ
    const id = setTimeout(() => setProgress(66), 50)
    if (!hasToken) {
      const go = setTimeout(() => navigate('/welcome', { replace: true }), PAUSE_MS)
      return () => { clearTimeout(id); clearTimeout(go) }
    }
    setError(null)
    let go
    getMe()
      .then((u) => {
        setUser(u)
        setProgress(100)
        go = setTimeout(() => navigate(u.onboarding_completed ? '/today' : '/onboarding', { replace: true }), PAUSE_MS)
      })
      .catch(setError)
    return () => { clearTimeout(id); clearTimeout(go) }
  }, [hasToken, attempt, navigate])

  const retry = () => setAttempt((n) => n + 1)
  if (error?.offline) return <NoConnection onRetry={retry} />
  if (error) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error.message}</Alert>
        <Button variant="contained" onClick={retry}>Повторить</Button>
      </Box>
    )
  }

  // Имя необязательное — без него просто «С возвращением»
  const line = user ? `С возвращением${user.name ? `, ${user.name}` : ''}` : TAGLINE
  return <Splash line={line} progress={progress} />
}
