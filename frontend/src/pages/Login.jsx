import { useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Divider, Link, Snackbar, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { login } from '../api/auth.js'
import { setToken } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import FormField from '../components/FormField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import useGoBack from '../hooks/useGoBack.js'

export default function Login() {
  const navigate = useNavigate()
  // «Назад» — на приветствие (1.1) или регистрацию, откуда пришли (макет 1.2)
  const back = useGoBack('/welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // Сюда выкидывает api/client.js на 401 с ?expired — показываем, почему (макет 2.12)
  const [params] = useSearchParams()
  const [expired, setExpired] = useState(params.has('expired'))

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(email, password)
      setToken(data.access_token)
      navigate(data.user.onboarding_completed ? '/today' : '/onboarding')
    } catch (err) {
      setError(err.fields?.email ? 'Проверь адрес почты' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <Snackbar
        open={expired}
        onClose={() => setExpired(false)}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LockOutlinedIcon fontSize="small" />
            Сессия истекла — войди заново
          </Box>
        }
      />
      <BackButton onClick={back} sx={{ mb: 3.5 }} />

      <Typography variant="h1" sx={{ mb: 1.5 }}>С возвращением</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Войди, чтобы увидеть комплект на сегодня.</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormField
          label="Электронная почта"
          icon={<MailOutlineIcon />}
          placeholder="sasha@mail.ru"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <Box>
          <PasswordField
            label="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Link component={RouterLink} to="/forgot-password" variant="subtitle1">
              Не помнишь пароль?
            </Link>
          </Box>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth sx={{ mt: 1 }}>
          {loading ? 'Входим…' : 'Войти'}
        </Button>

        {/* Разделитель «или» (1.2) */}
        <Divider sx={{ mt: 2 }}>или</Divider>

        <Typography variant="body2" align="center" sx={{ color: 'text.disabled', mt: 2 }}>
          Нет аккаунта?{' '}
          <Link component={RouterLink} to="/register" variant="subtitle1" sx={{ ml: 0.5 }}>
            Создать
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
