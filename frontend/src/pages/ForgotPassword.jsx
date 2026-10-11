import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MailOutlineIcon from '@mui/icons-material/MailOutline'

import { api } from '../api/client.js'
import AuthStatus from '../components/AuthStatus.jsx'

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


  if (sent) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
        <AuthStatus
          icon={<MailOutlineIcon />}
          title="Проверьте почту"
          text="Если аккаунт с этим адресом есть, мы отправили на него ссылку. Она действует 60 минут."
        >
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ bgcolor: 'background.paper', borderColor: 'divider', color: 'text.primary' }}
          >
            {loading ? 'Отправляем…' : 'Отправить ещё раз'}
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ borderColor: 'divider', color: 'text.primary' }}
          >
            Вернуться ко входу
          </Button>
        </AuthStatus>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <IconButton
        onClick={() => navigate('/login')}
        sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Typography variant="h1" sx={{ mb: 1.5 }}>
        Забыли пароль?
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
        Введите почту, на которую регистрировались, — пришлём ссылку для сброса пароля.
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

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Отправляем…' : 'Отправить ссылку'}
        </Button>
      </Box>
    </Box>
  )
}
