import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

import { api, setToken } from '../api/client.js'

// Сюда ведёт ссылка из письма: /reset-password?token=...
// После сохранения бэк сразу возвращает токен — человек залогинен.
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  // Ссылка без токена, истёкшая или уже использованная — бэк эти случаи не различает (400)
  const [linkBroken, setLinkBroken] = useState(!token)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setToken(data.access_token)
      navigate(data.user.onboarding_completed ? '/today' : '/onboarding', { replace: true })
    } catch (err) {
      if (err.status === 400) setLinkBroken(true)
      else setError(err.message)
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
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <IconButton
        onClick={() => navigate('/login')}
        sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {linkBroken ? (
        <>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            Ссылка устарела
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
            Ссылка работает 60 минут и только один раз. Запросите новую — придёт на ту же почту.
          </Typography>
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/forgot-password')}>
            Запросить новую ссылку
          </Button>
        </>
      ) : (
        <>
          <Typography variant="h1" sx={{ mb: 1.5 }}>
            Новый пароль
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
            Придумайте новый пароль. После сохранения сразу войдём в аккаунт.
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {error && <Alert severity="error">{error}</Alert>}

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
                  htmlInput: { minLength: 8 },
                }}
              />
            </Box>

            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
              {loading ? 'Сохраняем…' : 'Сохранить и войти'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  )
}
