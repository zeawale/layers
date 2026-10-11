import { useState } from 'react'
import { Link as RouterLink, Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'

import { changePassword } from '../api/auth.js'
import { getToken, setToken } from '../api/client.js'
import BackButton from '../components/BackButton.jsx'

// Макет 04a «Сменить пароль»
export default function ChangePassword() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!getToken()) return <Navigate to="/login" replace />

  async function save(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const data = await changePassword(current, next)
      // Старые токены после смены не работают — сразу кладём новый
      setToken(data.access_token)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <BackButton onClick={() => navigate('/profile')} sx={{ ml: -1, mb: 2 }} />
      <Typography variant="h2" sx={{ mb: 1 }}>Сменить пароль</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.5, mb: 3 }}>
        После смены пароля на других устройствах нужно будет войти заново.
      </Typography>

      <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>Текущий пароль</Typography>
          <TextField
            type="password"
            placeholder="••••••••"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            fullWidth
            autoComplete="current-password"
          />
        </Box>

        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>Новый пароль</Typography>
          <TextField
            type="password"
            placeholder="••••••••"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            fullWidth
            autoComplete="new-password"
            slotProps={{ htmlInput: { minLength: 8 } }}
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12, mt: 0.75 }}>Минимум 8 символов</Typography>
        </Box>

        <Button type="submit" variant="contained" size="large" fullWidth disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить'}
        </Button>

        <Typography variant="body2" align="center">
          <Link component={RouterLink} to="/forgot-password" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Забыли текущий пароль?
          </Link>
        </Typography>
      </Box>
    </Box>
  )
}
