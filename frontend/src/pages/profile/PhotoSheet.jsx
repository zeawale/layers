import { useRef, useState } from 'react'
import { Alert, Box, Button, CircularProgress, Drawer, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'

import { PHOTO_ACCEPT, uploadPhoto } from '../../api/photos.js'
import { updateMe } from '../../api/users.js'
import IconCircle from '../../components/IconCircle.jsx'

function Action({ icon, label, danger, onClick, disabled }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        all: 'unset',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        py: 2,
        cursor: disabled ? 'default' : 'pointer',
        color: danger ? 'error.main' : 'text.primary',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <IconCircle tone={danger ? 'secondary' : 'neutral'} size={40} sx={danger ? { color: 'error.main' } : undefined}>{icon}</IconCircle>
      <Typography variant="subtitle1" component="span">{label}</Typography>
    </Box>
  )
}

// Шторка «Фото профиля» — макеты 4.8 (фото есть) и 4.8.1 (фото нет).
// Фото грузится тем же POST /photos, что и фото вещи, и привязывается через avatar_photo_id
export default function PhotoSheet({ open, user, onClose, onChange }) {
  const camera = useRef(null)
  const gallery = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function apply(work) {
    setError('')
    setBusy(true)
    try {
      onChange(await work())
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // тот же файл можно выбрать ещё раз
    if (!file) return
    apply(async () => {
      const photo = await uploadPhoto(file)
      return updateMe({ avatar_photo_id: photo.id })
    })
  }

  function close() {
    if (busy) return
    setError('')
    onClose()
  }

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={close}
      slotProps={{ paper: { sx: { maxWidth: 390, mx: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28 } } }}
    >
      <Box sx={{ px: 3, pt: 1, pb: 3 }}>
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 1 }} />
        <Typography variant="h3" sx={{ mb: 0.5 }}>Фото профиля</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
          <Action icon={<PhotoCameraOutlinedIcon />} label="Сделать фото" onClick={() => camera.current.click()} disabled={busy} />
          <Action icon={<ImageOutlinedIcon />} label="Выбрать из галереи" onClick={() => gallery.current.click()} disabled={busy} />
          {user.avatar && (
            <Action
              icon={<DeleteOutlineIcon />}
              label="Удалить фото"
              danger
              onClick={() => apply(() => updateMe({ avatar_photo_id: null }))}
              disabled={busy}
            />
          )}
        </Box>

        {busy && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        <Button variant="outlined" size="large" fullWidth onClick={close} disabled={busy}>Отмена</Button>

        {/* На телефоне capture открывает фронтальную камеру, на компьютере — обычный выбор файла */}
        <input ref={camera} type="file" accept={PHOTO_ACCEPT} capture="user" hidden onChange={pick} />
        <input ref={gallery} type="file" accept={PHOTO_ACCEPT} hidden onChange={pick} />
      </Box>
    </Drawer>
  )
}
