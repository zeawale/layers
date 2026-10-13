import { useState } from 'react'
import { Link as RouterLink, useNavigate, useNavigationType, useSearchParams } from 'react-router-dom'
import { Alert, Box, Button, Link, Snackbar, Typography } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { login } from '../api/auth.js'
import { setToken } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import FormField from '../components/FormField.jsx'
import PasswordField from '../components/PasswordField.jsx'

export default function Login() {
  const navigate = useNavigate()
  // Вход часто открывается первым экраном, и тогда «назад» увёл бы из приложения.
  // Кнопку показываем, только если сюда перешли с другого экрана, например с регистрации.
  const canGoBack = useNavigationType() === 'PUSH'
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
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
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
      {canGoBack && <BackButton onClick={() => navigate(-1)} sx={{ mb: 2 }} />}

      <Typography variant="h1" sx={{ mb: 1.5 }}>С возвращением</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Войди, чтобы увидеть комплект на сегодня.</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="subtitle1" sx={{ color: 'text.secondary' }}>
              Не помнишь пароль?
            </Link>
          </Box>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Входим…' : 'Войти'}
        </Button>

        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          Нет аккаунта?{' '}
          <Link component={RouterLink} to="/register" variant="subtitle1" sx={{ color: 'text.primary' }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
