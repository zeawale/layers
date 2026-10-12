import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Alert, Box, Button, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import { changePassword } from '../../api/auth.js'
import { setToken } from '../../api/client.js'
import AuthStatus from '../../components/AuthStatus.jsx'
import PasswordField from '../../components/PasswordField.jsx'

// Экран 4.7 «Сменить пароль». Своего макета нет — собран по экрану нового пароля 1.2.3
export default function PasswordChange() {
  const { leave } = useOutletContext()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setSaving(true)
    try {
      const data = await changePassword(current, next)
      // Старые токены после смены не работают: без нового следующий запрос получил бы 401
      setToken(data.access_token)
      setDone(true)
    } catch (err) {
      // Неверный текущий пароль — 400, а не 401: человек остаётся в приложении (API.md)
      if (err.status === 400) setFieldErrors({ current: err.message })
      else if (err.fields?.new_password) setFieldErrors({ next: 'Пароль — минимум 8 символов' })
      else setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (done) {
    return (
      <AuthStatus icon={<CheckIcon />} title="Пароль изменён" text="На других устройствах нужно будет войти заново.">
        <Button variant="contained" size="large" fullWidth onClick={leave}>В профиль</Button>
      </AuthStatus>
    )
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h2" sx={{ mb: 1.25 }}>Сменить пароль</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.75 }}>
        Введи текущий пароль и придумай новый. На других устройствах после этого нужно будет войти заново.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <PasswordField
          label="Текущий пароль"
          toggle
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          required
          autoFocus
          autoComplete="current-password"
          error={fieldErrors.current}
        />
        <Box>
          <PasswordField
            label="Новый пароль"
            toggle
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            error={fieldErrors.next}
          />
          <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 0.75 }}>Минимум 8 символов</Typography>
        </Box>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={saving}>
          {saving ? 'Сохраняем…' : 'Сохранить пароль'}
        </Button>
      </Box>
    </Box>
  )
}
