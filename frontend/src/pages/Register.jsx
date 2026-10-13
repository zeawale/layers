import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Checkbox, FormControlLabel, Link, Typography } from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

import { register } from '../api/auth.js'
import { setToken } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'
import FormField from '../components/FormField.jsx'
import PasswordField from '../components/PasswordField.jsx'

// Ошибки 422 по полям — свой текст по-русски вместо английского текста валидатора
const FIELD_ERRORS = {
  email: 'Проверь адрес почты',
  password: 'Пароль — минимум 8 символов',
  name: 'Имя — не длиннее 50 символов',
}

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      const data = await register({ email, password, name: name.trim() })
      setToken(data.access_token)
      navigate('/onboarding')
    } catch (err) {
      if (err.fields) setFieldErrors(Object.fromEntries(Object.keys(err.fields).map((f) => [f, FIELD_ERRORS[f] ?? err.fields[f]])))
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <BackButton onClick={() => navigate('/login', { replace: true })} sx={{ mb: 2 }} />

      <Typography variant="h1" sx={{ mb: 1.5 }}>Создадим твой{'\n'}гардероб</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Минута на регистрацию — и сервис начнёт подбирать комплекты.</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <FormField
          label="Как к тебе обращаться · необязательно, до 50 символов"
          icon={<PersonOutlineIcon />}
          placeholder="Саша"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          error={fieldErrors.name}
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />

        <FormField
          label="Электронная почта"
          icon={<MailOutlineIcon />}
          placeholder="sasha@mail.ru"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          error={fieldErrors.email}
        />

        <PasswordField
          label="Пароль · минимум 8 символов"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          error={fieldErrors.password}
        />

        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />}
          label={
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              Соглашаюсь с условиями сервиса и обработкой персональных данных
            </Typography>
          }
          sx={{ alignItems: 'flex-start', mx: 0 }}
        />

        <Button type="submit" variant="contained" size="large" disabled={loading || !agreed} fullWidth>
          {loading ? 'Регистрируем…' : 'Создать аккаунт'}
        </Button>

        <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
          Уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login" variant="subtitle1" sx={{ color: 'text.primary' }}>
            Войти
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
