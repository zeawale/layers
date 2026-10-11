import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { getToken, mediaUrl } from '../api/client.js'
import { deleteItem, getItem } from '../api/items.js'
import useAttributes from '../hooks/useAttributes.js'

// «2 сентября» и «2 сентября 2026»
function formatDate(iso, withYear) {
  const opts = withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }
  return new Date(iso).toLocaleDateString('ru-RU', opts).replace(' г.', '')
}

// Макеты 3.2 «Карточка вещи» и 3.3 «Удалить вещь»
export default function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { attrs, label, error: attrsError, retry: retryAttrs } = useAttributes()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    setError('')
    getItem(id)
      .then(setItem)
      .catch((err) => setError(err.message))
  }, [id, attempt])

  if (!getToken()) return <Navigate to="/login" replace />

  async function handleDelete() {
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteItem(id)
      navigate('/wardrobe', { replace: true })
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const failed = error || attrsError
  const photo = mediaUrl(item?.photo?.url)

  const rows = item && attrs ? [
    ['Категория', label('category', item.category)],
    ['Цвет', label('color', item.color)],
    // Пустой список сезонов — вещь всесезонная (API.md, Item)
    ['Сезон', item.season.length
      ? item.season.map((s, i) => (i ? label('season', s).toLowerCase() : label('season', s))).join(', ')
      : 'Всесезонная'],
    // Без стиля вещь подходит под любой
    ['Стиль', item.style ? label('style', item.style) : 'Любой'],
    ['Теплота', `${'●'.repeat(item.warmth)}${'○'.repeat(5 - item.warmth)}  ${label('warmth', item.warmth).toLowerCase()}`],
    ['Защита от осадков', label('water_resistance', item.water_resistance)],
    ['Добавлена', formatDate(item.created_at, true)],
  ] : []

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <IconButton
        onClick={() => navigate('/wardrobe')}
        sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {failed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Alert severity="error" sx={{ width: '100%' }}>{failed}</Alert>
          <Button variant="outlined" onClick={() => { setAttempt((n) => n + 1); retryAttrs() }}>Повторить</Button>
        </Box>
      )}

      {!failed && (!item || !attrs) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      )}

      {!failed && item && attrs && (
        <>
          <Box
            sx={{
              aspectRatio: '1 / 1',
              borderRadius: '20px',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              mb: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.disabled',
            }}
          >
            {photo ? (
              <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <CheckroomOutlined sx={{ fontSize: 64 }} />
            )}
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {label('category', item.category)} · добавлена {formatDate(item.created_at, false)}
          </Typography>
          <Typography variant="h1" sx={{ mb: 2.5 }}>{item.name}</Typography>

          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, px: 2, mb: 3 }}>
            {rows.map(([name, value], i) => (
              <Box
                key={name}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  py: 1.5,
                  borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>{name}</Typography>
                <Typography sx={{ fontSize: 15, fontWeight: 500, textAlign: 'right', whiteSpace: 'pre' }}>{value}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" size="large" fullWidth onClick={() => navigate(`/wardrobe/${id}/edit`)}>
              Редактировать
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              color="error"
              onClick={() => setConfirmOpen(true)}
              sx={{ borderColor: 'divider' }}
            >
              Удалить
            </Button>
          </Box>

          <Dialog open={confirmOpen} onClose={() => !deleting && setConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>Удалить «{item.name}»?</DialogTitle>
            <DialogContent>
              <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.5 }}>
                Вещь пропадёт из гардероба и больше не попадёт в комплекты.
              </Typography>
              {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
            </DialogContent>
            <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2 }}>
              <Button variant="contained" color="error" fullWidth onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Удаляем…' : 'Удалить'}
              </Button>
              <Button fullWidth onClick={() => setConfirmOpen(false)} disabled={deleting} sx={{ color: 'text.primary', ml: '0 !important' }}>
                Отмена
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  )
}
