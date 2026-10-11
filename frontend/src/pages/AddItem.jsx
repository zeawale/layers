import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, IconButton, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { getToken, mediaUrl } from '../api/client.js'
import { createItem, recognizeItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm, { EMPTY_ITEM } from '../components/ItemForm.jsx'
import useAttributes from '../hooks/useAttributes.js'
import PhotoStep from './wardrobe/PhotoStep.jsx'
import RecognizingStep from './wardrobe/RecognizingStep.jsx'

// Добавление вещи — макеты 3.4 → 3.5 → 3.6: фото, распознавание, проверка полей.
// Распознавание только предзаполняет форму, сохраняет человек кнопкой (HANDBOOK, раздел 7).
export default function AddItem() {
  const navigate = useNavigate()
  const { attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [stage, setStage] = useState('photo') // photo → upload → recognize → form
  const [preview, setPreview] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [item, setItem] = useState(EMPTY_ITEM)
  const [auto, setAuto] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Локальный адрес превью освобождаем, когда он больше не нужен
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (!getToken()) return <Navigate to="/login" replace />

  async function handleFile(file) {
    setError('')
    setPreview(URL.createObjectURL(file))
    setStage('upload')
    let uploaded
    try {
      uploaded = await uploadPhoto(file)
      setPhoto(uploaded)
    } catch (err) {
      setError(err.message)
      setStage('photo')
      return
    }
    setStage('recognize')
    try {
      const r = await recognizeItem(uploaded.id)
      // Ниже порога бэк присылает value: null — такое поле человек заполнит сам
      setItem({ ...EMPTY_ITEM, category: r.category.value, color: r.color.value })
      setAuto({ category: Boolean(r.category.value), color: Boolean(r.color.value) })
    } catch {
      // Не распознали — не беда: фото есть, поля заполнит человек
      setItem(EMPTY_ITEM)
      setAuto({})
    }
    setStage('form')
  }

  function manual() {
    setPhoto(null)
    setPreview(null)
    setItem(EMPTY_ITEM)
    setAuto({})
    setStage('form')
  }

  function retake() {
    setPhoto(null)
    setPreview(null)
    setError('')
    setStage('photo')
  }

  async function save() {
    setError('')
    setSaving(true)
    try {
      await createItem({ ...item, name: item.name.trim(), photo_id: photo?.id })
      navigate('/wardrobe', { replace: true })
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const step = stage === 'form' ? 2 : 1
  const recognized = auto.category || auto.color

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => (stage === 'form' ? retake() : navigate('/wardrobe'))}
          disabled={stage === 'upload' || stage === 'recognize'}
          sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
        >
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography sx={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 17 }}>Новая вещь</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 40, textAlign: 'right' }}>
          {step} / 2
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {stage === 'photo' && <PhotoStep onFile={handleFile} onManual={manual} />}

      {(stage === 'upload' || stage === 'recognize') && <RecognizingStep preview={preview} stage={stage} />}

      {stage === 'form' && (
        <>
          {recognized && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h2" sx={{ mb: 0.5 }}>Заполнили автоматически</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>Проверьте поля — любое можно исправить</Typography>
            </Box>
          )}

          {photo && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                component="img"
                src={preview ?? mediaUrl(photo.url)}
                alt=""
                sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: '16px', display: 'block' }}
              />
              <Button variant="outlined" onClick={retake} sx={{ borderColor: 'divider', color: 'text.primary' }}>
                Переснять фото
              </Button>
            </Box>
          )}

          {attrs && (
            <ItemForm
              attrs={attrs}
              value={item}
              onChange={setItem}
              auto={auto}
              onSubmit={save}
              submitLabel="Сохранить в гардероб"
              loading={saving}
            />
          )}
          {!attrs && !attrsError && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>
          )}
          {attrsError && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Alert severity="error" sx={{ width: '100%' }}>{attrsError}</Alert>
              <Button variant="outlined" onClick={retryAttrs}>Повторить</Button>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
