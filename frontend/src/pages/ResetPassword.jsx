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
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import { api } from '../api/client.js'
import AuthStatus from '../components/AuthStatus.jsx'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 3,
    bgcolor: 'background.paper',
    '& fieldset': { borderColor: 'divider' },
  },
}

function PasswordField({ label, value, onChange, autoFocus }) {
  const [visible, setVisible] = useState(false)
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
        {label}
      </Typography>
      <TextField
        placeholder="••••••••"
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        autoFocus={autoFocus}
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
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setVisible(!visible)}
                  aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
                  sx={{ color: 'text.secondary' }}
                >
                  {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                </IconButton>
              </InputAdornment>
            ),
          },
          htmlInput: { minLength: 8 },
        }}
      />
    </Box>
  )
}

// Сюда ведёт ссылка из письма: /reset-password?token=...
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const [password, setPassword] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  // Ссылка без токена, истёкшая или уже использованная — бэк эти случаи не различает (400)
  const [linkBroken, setLinkBroken] = useState(!token)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== repeat) {
      setError('Пароли не совпадают')
      return
    }
    setLoading(true)
    try {
      // Бэк сразу отдаёт токен, но по макету человек входит заново с новым паролем
      await api('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      })
      setDone(true)
    } catch (err) {
      if (err.status === 400) setLinkBroken(true)
      else setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (done || linkBroken) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
        {done ? (
          <AuthStatus icon={<CheckIcon />} title="Пароль изменён" text="Теперь войдите с новым паролем.">
            <Button variant="contained" size="large" fullWidth onClick={() => navigate('/login', { replace: true })}>
              Ко входу
            </Button>
          </AuthStatus>
        ) : (
          <AuthStatus
            icon={<AccessTimeIcon />}
            tone="secondary"
            title="Ссылка больше не работает"
            text="Ссылка действует 60 минут и только один раз. Запросите новую."
          >
            <Button variant="contained" size="large" fullWidth onClick={() => navigate('/forgot-password')}>
              Запросить новую ссылку
            </Button>
          </AuthStatus>
        )}
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
        Новый пароль
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
        Придумайте новый пароль. После сохранения старый перестанет работать.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <PasswordField label="Новый пароль" value={password} onChange={setPassword} autoFocus />
        <Box>
          <PasswordField label="Повторите пароль" value={repeat} onChange={setRepeat} />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, fontSize: 12 }}>
            Минимум 8 символов
          </Typography>
        </Box>

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Сохраняем…' : 'Сохранить пароль'}
        </Button>
      </Box>
    </Box>
  )
}
