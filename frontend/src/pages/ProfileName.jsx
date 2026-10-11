import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material'

import { getToken } from '../api/client.js'
import { uploadPhoto } from '../api/photos.js'
import { getMe, updateMe } from '../api/users.js'
import Avatar from '../components/Avatar.jsx'
import BackButton from '../components/BackButton.jsx'

const ACCEPT = 'image/jpeg,image/png,image/webp'

// Макет 04a «Как к вам обращаться»: имя и фото профиля
export default function ProfileName() {
  const navigate = useNavigate()
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState(undefined) // undefined — не меняли, null — убрать, объект — новое фото
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMe()
      .then((u) => { setUser(u); setName(u.name ?? '') })
      .catch((err) => setError(err.message))
  }, [])

  if (!getToken()) return <Navigate to="/login" replace />

  async function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      setPhoto(await uploadPhoto(file))
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const changes = {}
    // Пустая строка стирает имя (API.md, PATCH /users/me)
    if (name.trim() !== (user.name ?? '')) changes.name = name.trim()
    if (photo !== undefined) changes.avatar_photo_id = photo?.id ?? null
    try {
      if (Object.keys(changes).length) await updateMe(changes)
      navigate('/profile', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const current = photo === undefined ? user?.avatar : photo

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <BackButton onClick={() => navigate('/profile')} sx={{ ml: -1, mb: 2 }} />
      <Typography variant="h2" sx={{ mb: 1 }}>Как к вам обращаться</Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.5, mb: 3 }}>
        Имя показываем в приветствии. Необязательно, до 50 символов. Без имени пишем просто «Доброе утро».
      </Typography>

      {!user && !error && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {user && (
        <Box component="form" onSubmit={save} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Фото профиля</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {uploading ? (
                <Box sx={{ width: 72, height: 72, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <Avatar user={{ ...user, name: name || user.name }} photo={current} />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Button onClick={() => cameraRef.current.click()} disabled={uploading} sx={{ color: 'text.primary', minHeight: 32 }}>
                  Сделать фото
                </Button>
                <Button onClick={() => galleryRef.current.click()} disabled={uploading} sx={{ color: 'text.primary', minHeight: 32 }}>
                  Выбрать из галереи
                </Button>
                {current && (
                  <Button onClick={() => setPhoto(null)} disabled={uploading} color="error" sx={{ minHeight: 32 }}>
                    Удалить фото
                  </Button>
                )}
              </Box>
            </Box>
            <input ref={cameraRef} type="file" accept={ACCEPT} capture="user" hidden onChange={pick} />
            <input ref={galleryRef} type="file" accept={ACCEPT} hidden onChange={pick} />
          </Box>

          <Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>Имя</Typography>
            <TextField
              placeholder="Саша"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              autoComplete="name"
              slotProps={{ htmlInput: { maxLength: 50 } }}
            />
          </Box>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={saving || uploading}>
            {saving ? 'Сохраняем…' : 'Сохранить'}
          </Button>
        </Box>
      )}
    </Box>
  )
}
