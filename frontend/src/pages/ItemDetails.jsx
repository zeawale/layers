import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'

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

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <BackButton onClick={() => toWardrobe()} sx={{ mb: 2 }} />

      {missing && <ItemMissing onBack={() => toWardrobe()} />}

      {failed && <LoadError message={failed} onRetry={() => { setAttempt((n) => n + 1); retryAttrs() }} />}

      {!error && !failed && (!item || !attrs) && <Loading />}

      {!error && !failed && item && attrs && (
        <>
          <ItemPhoto src={mediaUrl(item.photo?.url)} sx={{ borderRadius: '20px', bgcolor: 'background.paper', mb: 2.5 }} />

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
            {label('category', item.category)} · добавлена {formatDate(item.created_at, false)}
          </Typography>
          {/* Название до 100 символов без пробелов не должно вылезать за экран */}
          <Typography variant="h1" sx={{ mb: 2.5, overflowWrap: 'anywhere' }}>{item.name}</Typography>

          <ItemFacts item={item} label={label} />

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" size="large" fullWidth onClick={() => navigate(`/wardrobe/${id}/edit`)}>
              Редактировать
            </Button>
            <Button variant="outlined" size="large" fullWidth onClick={() => setConfirmOpen(true)} sx={{ color: 'error.main' }}>
              Удалить
            </Button>
          </Box>

          <ConfirmDialog
            open={confirmOpen}
            title={`Удалить «${item.name}»?`}
            text="Вещь пропадёт из гардероба и больше не попадёт в комплекты."
            loading={deleting}
            error={deleteError}
            onConfirm={handleDelete}
            onClose={() => { setConfirmOpen(false); setDeleteError('') }}
          />
        </>
      )}

      <Notice />
    </Box>
  )
}
