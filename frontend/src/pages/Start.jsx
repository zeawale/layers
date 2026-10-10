import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress } from '@mui/material'

import { api, getToken } from '../api/client.js'

// Точка входа на «/»: решает, куда отправить человека.
// Нет токена → вход. Есть → смотрим профиль: онбординг не пройден → онбординг, иначе «Сегодня».
export default function Start() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const hasToken = Boolean(getToken())

  useEffect(() => {
    if (!hasToken) return
    setError('')
    api('/users/me')
      .then((user) => navigate(user.onboarding_completed ? '/today' : '/onboarding', { replace: true }))
      .catch((err) => setError(err.message))
  }, [hasToken, attempt, navigate])

  if (!hasToken) return <Navigate to="/login" replace />

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
      {error ? (
        <>
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
          <Button variant="contained" onClick={() => setAttempt((n) => n + 1)}>Повторить</Button>
        </>
      ) : (
        <CircularProgress size={28} />
      )}
    </Box>
  )
}
