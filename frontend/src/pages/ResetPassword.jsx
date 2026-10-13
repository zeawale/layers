import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Typography } from '@mui/material'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckIcon from '@mui/icons-material/Check'

import { confirmPasswordReset } from '../api/auth.js'
import AuthStatus from '../components/AuthStatus.jsx'
import BackButton from '../components/BackButton.jsx'
import PasswordField from '../components/PasswordField.jsx'

// Сюда ведёт ссылка из письма: /reset-password?token=... Макеты 1.2.3–1.2.5
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  // Ссылка без токена, истёкшая или уже использованная — бэк эти случаи не различает (400)
  const [linkBroken, setLinkBroken] = useState(!token)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const toLogin = () => navigate('/login', { replace: true })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setPasswordError('')
    if (password !== repeat) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      // Бэк сразу отдаёт токен, но по макету человек входит заново с новым паролем (HANDBOOK, раздел 8)
      await confirmPasswordReset(token, password)
      setDone(true)
    } catch (err) {
      if (err.status === 400) setLinkBroken(true)
      else if (err.fields?.password) setPasswordError('Пароль — минимум 8 символов')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done || linkBroken) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
        {done ? (
          <AuthStatus icon={<CheckIcon />} title="Пароль изменён" text="Теперь войди с новым паролем.">
            <Button variant="contained" size="large" fullWidth onClick={toLogin}>Ко входу</Button>
          </AuthStatus>
        ) : (
          <AuthStatus
            icon={<AccessTimeIcon />}
            tone="secondary"
            title="Ссылка больше не работает"
            text="Ссылка действует 60 минут и только один раз. Запроси новую."
          >
            <Button variant="contained" size="large" fullWidth onClick={() => navigate('/forgot-password', { replace: true })}>
              Запросить новую ссылку
            </Button>
          </AuthStatus>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <BackButton onClick={toLogin} sx={{ mb: 2 }} />

      <Typography variant="h1" sx={{ mb: 1.5 }}>Новый пароль</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>
        Придумай новый пароль. После сохранения старый перестанет работать.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <PasswordField
          label="Новый пароль"
          toggle
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoFocus
          autoComplete="new-password"
          error={passwordError}
        />
        <Box>
          <PasswordField
            label="Повтори пароль"
            toggle
            value={repeat}
            onChange={(e) => setRepeat(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.75 }}>Минимум 8 символов</Typography>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Сохраняем…' : 'Сохранить пароль'}
        </Button>
      </Box>
    </Box>
  )
}
