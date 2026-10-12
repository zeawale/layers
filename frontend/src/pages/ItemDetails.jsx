import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import { getToken, mediaUrl } from '../api/client.js'
import { deleteItem, getItem } from '../api/items.js'
import BackButton from '../components/BackButton.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ItemPhoto from '../components/ItemPhoto.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import Notice from '../components/Notice.jsx'
import useAttributes from '../hooks/useAttributes.js'
import ItemFacts, { formatDate } from './wardrobe/ItemFacts.jsx'
import ItemMissing from './wardrobe/ItemMissing.jsx'

// Макеты 3.2 «Карточка вещи» и 3.3 «Удалить вещь»
export default function ItemDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { attrs, label, error: attrsError, retry: retryAttrs } = useAttributes()
  const [item, setItem] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    setError(null)
    getItem(id)
      .then(setItem)
      .catch(setError)
  }, [id, attempt])

  if (!getToken()) return <Navigate to="/login" replace />

  const toWardrobe = (state) => navigate('/wardrobe', { replace: true, state })

  async function handleDelete() {
    setDeleteError('')
    setDeleting(true)
    try {
      await deleteItem(id)
      toWardrobe({ notice: `Удалили «${item.name}»` })
    } catch (err) {
      // Вещь уже удалили в другой вкладке — цель достигнута
      if (err.status === 404) return toWardrobe({ notice: `Удалили «${item.name}»` })
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const missing = error?.status === 404 || error?.status === 403
  const failed = (!missing && error?.message) || attrsError

  const ready = !error && !failed && item && attrs

  // Пока грузится или ошибка — обычная шапка; карточка (3.2) — фото во всю ширину, «назад» поверх него
  if (!ready) {
    return (
      <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
        <BackButton onClick={() => toWardrobe()} sx={{ mb: 2 }} />
        {missing && <ItemMissing onBack={() => toWardrobe()} />}
        {failed && <LoadError message={failed} onRetry={() => { setAttempt((n) => n + 1); retryAttrs() }} />}
        {!error && !failed && <Loading />}
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', pb: 4 }}>
      <Box sx={{ position: 'relative' }}>
        {/* Фото целиком: снизу поле под заходящий на фото «лист», сверху — под кнопку «назад» */}
        <ItemPhoto src={mediaUrl(item.photo?.url)} contain sx={{ aspectRatio: '390 / 414', pt: 2, pb: 3.5, bgcolor: 'background.paper' }} />
        <BackButton onClick={() => toWardrobe()} sx={{ position: 'absolute', top: 20, left: 20 }} />
      </Box>

      {/* «Лист» со скруглёнными верхними углами заходит на фото, как в макете */}
      <Box sx={{ position: 'relative', mt: -1.75, px: 3, pt: 3.5, borderRadius: '24px 24px 0 0', bgcolor: 'background.default' }}>
        <Typography variant="overline" component="p" sx={{ color: 'text.disabled' }}>
          {label('category', item.category)} · добавлена {formatDate(item.created_at, false)}
        </Typography>
        {/* Название до 100 символов без пробелов не должно вылезать за экран */}
        <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2.25, overflowWrap: 'anywhere' }}>{item.name}</Typography>

        <ItemFacts item={item} label={label} warmthMax={attrs.warmth.length} />

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.25 }}>
          <Button variant="outlined" size="large" onClick={() => navigate(`/wardrobe/${id}/edit`)}>
            Редактировать
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<DeleteOutlineIcon />}
            onClick={() => setConfirmOpen(true)}
            sx={(t) => ({ color: 'error.main', borderColor: alpha(t.palette.error.main, 0.5), '&:hover': { borderColor: 'error.main' } })}
          >
            Удалить
          </Button>
        </Box>

        <ConfirmDialog
          open={confirmOpen}
          image={mediaUrl(item.photo?.url)}
          title={`Удалить «${item.name}»?`}
          text="Вещь пропадёт из гардероба и больше не попадёт в комплекты."
          loading={deleting}
          error={deleteError}
          onConfirm={handleDelete}
          onClose={() => { setConfirmOpen(false); setDeleteError('') }}
        />
      </Box>

      <Notice />
    </Box>
  )
}
