import { useEffect, useState } from 'react'
import { Alert, Box, Button, Typography } from '@mui/material'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { requestPasswordReset } from '../api/auth.js'
import AuthStatus from '../components/AuthStatus.jsx'
import BackButton from '../components/BackButton.jsx'
import FormField from '../components/FormField.jsx'
import useGoBack from '../hooks/useGoBack.js'

// Бэк шлёт письмо на один адрес не чаще раза в минуту и всё равно отвечает 204 (API.md):
// столько же держим «Отправить ещё раз» выключенной, чтобы нажатие не уходило в пустоту
const COOLDOWN = 60

// «0:42»
const formatCountdown = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// «Не помнишь пароль?» — макеты 1.2.1 и 1.2.2. Ответ всегда один, есть такой email или нет
export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [left, setLeft] = useState(0) // секунд до следующей отправки

  useEffect(() => {
    if (left <= 0) return
    const timer = setTimeout(() => setLeft(left - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])

  // Сюда приходят со входа — туда и возвращаемся шагом назад, а по прямой ссылке — на вход
  const toLogin = useGoBack('/login')

  async function handleSubmit(e) {
    e?.preventDefault()
    setError('')
    setEmailError('')
    setLoading(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
      setLeft(COOLDOWN)
    } catch (err) {
      if (err.fields?.email) setEmailError('Проверь адрес почты')
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
        <BackButton onClick={toLogin} />
        <AuthStatus
          withBack
          icon={<MailOutlineIcon />}
          title="Проверь почту"
          text="Если аккаунт с этим адресом есть, мы отправили на него ссылку. Она действует 60 минут."
        >
          {error && <Alert severity="error">{error}</Alert>}
          <Button variant="outlined" size="large" fullWidth onClick={handleSubmit} disabled={loading || left > 0}>
            {loading ? 'Отправляем…' : left > 0 ? `Отправить ещё раз через ${formatCountdown(left)}` : 'Отправить ещё раз'}
          </Button>
          <Button variant="outlinedClear" size="large" fullWidth onClick={toLogin}>
            Вернуться ко входу
          </Button>
        </AuthStatus>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <BackButton onClick={toLogin} sx={{ mb: 2.75 }} />

      {/* Экраны пароля мельче входа: заголовок 32, текст 14 (макеты 1.2.1–1.2.5) */}
      <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>Не помнишь пароль?</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.75 }}>
        Введи почту от аккаунта — пришлём ссылку для сброса пароля.
      </Typography>

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
          error={emailError}
        />

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Отправляем…' : 'Отправить ссылку'}
        </Button>
      </Box>
    </Box>
  )
}
