import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
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
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { api } from '../api/client.js'

// «Забыли пароль?»: просим ссылку на почту. Бэк всегда отвечает 204,
// есть такой email или нет, поэтому и текст после отправки один и тот же.
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'background.paper',
      '& fieldset': { borderColor: 'divider' },
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 100px #ffffff inset',
      WebkitTextFillColor: '#1c1b18',
    },
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <IconButton
        onClick={() => (sent ? setSent(false) : navigate('/login'))}
        sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {sent ? (
        <>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            Проверьте почту
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
            Если аккаунт с адресом {email} есть, мы отправили на него ссылку. Она работает 60 минут.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <Button variant="contained" size="large" fullWidth onClick={() => navigate('/login')}>
              Вернуться ко входу
            </Button>

            <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
              Письмо не пришло?{' '}
              <Link
                component="button"
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ fontWeight: 700, color: 'text.primary', verticalAlign: 'baseline' }}
              >
                {loading ? 'Отправляем…' : 'Отправить ещё раз'}
              </Link>
            </Typography>
          </Box>
        </>
      ) : (
        <>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            Забыли пароль?
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
            Введите почту, с которой регистрировались, — пришлём ссылку для нового пароля.
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
                sx={fieldSx}
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

            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? 'Отправляем…' : 'Отправить ссылку'}
            </Button>

            <Typography variant="body2" align="center" sx={{ color: 'text.secondary' }}>
              Вспомнили пароль?{' '}
              <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Войти
              </Link>
            </Typography>
          </Box>
        </>
      )}
    </Box>
  )
}
