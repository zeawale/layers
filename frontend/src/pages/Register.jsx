import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Link, TextField, Typography } from '@mui/material'

import { api, setToken } from '../api/client.js'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', px: 3 }}>
      <Typography variant="h1" sx={{ mb: 1 }}>Layers</Typography>
      <Typography variant="h3" sx={{ mb: 4 }}>Регистрация</Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          fullWidth
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          fullWidth
        />
        <TextField
          label="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          inputProps={{ minLength: 8 }}
          helperText="Не менее 8 символов"
          autoComplete="new-password"
          fullWidth
        />

        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
          {loading ? 'Регистрируем…' : 'Создать аккаунт'}
        </Button>

        <Typography variant="body2" align="center" sx={{ mt: 1 }}>
          Уже есть аккаунт?{' '}
          <Link component={RouterLink} to="/login">Войти</Link>
        </Typography>
      </Box>
    </Box>
  )
}
