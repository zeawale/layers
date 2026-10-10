import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

import { api, setToken } from '../api/client.js'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const body = { email, password }
      if (name.trim()) body.name = name.trim()
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setToken(data.access_token)
      navigate('/onboarding')
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
      <IconButton onClick={() => navigate(-1)} sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}>
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Typography variant="h1" sx={{ mb: 1.5 }}>
        Создадим ваш{'\n'}гардероб
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
        Минута на регистрацию — и сервис начнёт подбирать комплекты.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
            Как к вам обращаться · необязательно, до 50 символов
          </Typography>
          <TextField
            placeholder="Саша"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            fullWidth
            sx={fieldSx}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              },
              htmlInput: { maxLength: 50 },
            }}
          />
        </Box>

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

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
            Пароль · минимум 8 символов
          </Typography>
          <TextField
            placeholder="••••••••"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            inputProps={{ minLength: 8 }}
            autoComplete="new-password"
            fullWidth
            sx={fieldSx}
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

        <FormControlLabel
          control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
          label={
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
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
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Войти
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
