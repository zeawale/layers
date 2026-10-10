import { useState } from 'react'
import { Link as RouterLink, useNavigate, useNavigationType } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { api, setToken } from '../api/client.js'

export default function Login() {
  const navigate = useNavigate()
  // Вход часто открывается первым экраном, и тогда «назад» увёл бы из приложения.
  // Кнопку показываем, только если сюда перешли с другого экрана, например с регистрации.
  const canGoBack = useNavigationType() === 'PUSH'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      setToken(data.access_token)
      navigate(data.user.onboarding_completed ? '/today' : '/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      {canGoBack && (
        <IconButton onClick={() => navigate(-1)} sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
      )}

      <Typography variant="h1" sx={{ mb: 1.5 }}>
        С возвращением
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
        Войдите, чтобы увидеть комплект на сегодня.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
            Электронная почта
          </Typography>
          <TextField
            placeholder="sasha@mail.ru"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
            Пароль
          </Typography>
          <TextField
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            fullWidth
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Входим…' : 'Войти'}
        </Button>

        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          Нет аккаунта?{' '}
          <Link component={RouterLink} to="/register" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
