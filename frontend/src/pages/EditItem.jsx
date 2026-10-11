import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, IconButton, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { getToken, mediaUrl } from '../api/client.js'
import { getItem, updateItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm from '../components/ItemForm.jsx'
import useAttributes from '../hooks/useAttributes.js'

const FIELDS = ['name', 'category', 'color', 'warmth', 'style', 'season', 'water_resistance']

// Макет 3.9 «Редактировать вещь» — форма добавления с кнопкой «Сохранить»
export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const { attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [item, setItem] = useState(null)
  const [form, setForm] = useState(null)
  const [photo, setPhoto] = useState(null) // { id, url } — текущее фото или только что загруженное
  const [loadError, setLoadError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadError('')
    getItem(id)
      .then((data) => {
        setItem(data)
        setForm(Object.fromEntries(FIELDS.map((f) => [f, data[f]])))
        setPhoto(data.photo)
      })
      .catch((err) => setLoadError(err.message))
  }, [id, attempt])

  if (!getToken()) return <Navigate to="/login" replace />

  async function replacePhoto(e) {
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

  async function save() {
    setError('')
    setSaving(true)
    // PATCH принимает только изменённые поля
    const changes = {}
    for (const f of FIELDS) {
      const value = f === 'name' ? form.name.trim() : form[f]
      if (JSON.stringify(value) !== JSON.stringify(item[f])) changes[f] = value
    }
    if ((photo?.id ?? null) !== (item.photo?.id ?? null)) changes.photo_id = photo?.id ?? null
    try {
      if (Object.keys(changes).length) await updateItem(id, changes)
      navigate(`/wardrobe/${id}`, { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const failed = loadError || attrsError
  const url = mediaUrl(photo?.url)

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(`/wardrobe/${id}`)}
          sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 17, mr: 5 }}>
          Редактировать вещь
        </Typography>
      </Box>

      {failed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Alert severity="error" sx={{ width: '100%' }}>{failed}</Alert>
          <Button variant="outlined" onClick={() => { setAttempt((n) => n + 1); retryAttrs() }}>Повторить</Button>
        </Box>
      )}

      {!failed && (!form || !attrs) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      )}

      {!failed && form && attrs && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>Фото вещи</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box
              sx={{
                width: 88,
                height: 88,
                flexShrink: 0,
                borderRadius: '16px',
                bgcolor: 'background.paper',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.disabled',
              }}
            >
              {uploading ? (
                <CircularProgress size={24} />
              ) : url ? (
                <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <CheckroomOutlined sx={{ fontSize: 36 }} />
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                sx={{ borderColor: 'divider', color: 'text.primary', minHeight: 40 }}
              >
                {photo ? 'Заменить фото' : 'Добавить фото'}
              </Button>
              {photo && (
                <Button onClick={() => setPhoto(null)} disabled={uploading} color="error" sx={{ minHeight: 32 }}>
                  Удалить фото
                </Button>
              )}
            </Box>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={replacePhoto} />
          </Box>

          <ItemForm
            attrs={attrs}
            value={form}
            onChange={setForm}
            onSubmit={save}
            submitLabel="Сохранить"
            loading={saving || uploading}
          />
        </>
      )}
    </Box>
  )
}
