import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'

import { getToken } from '../api/client.js'
import { createItem, recognizeItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm, { EMPTY_ITEM, itemFieldErrors } from '../components/ItemForm.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import useAttributes from '../hooks/useAttributes.js'
import PhotoStep from './wardrobe/PhotoStep.jsx'
import RecognizingStep from './wardrobe/RecognizingStep.jsx'

// Добавление вещи — макеты 3.4 «Фото» → 3.5 «Распознаём» → 3.6 «Проверка полей», после сохранения — гардероб (3.7).
// Распознавание только предзаполняет форму, сохраняет человек кнопкой (HANDBOOK, раздел 7)
export default function AddItem() {
  const navigate = useNavigate()
  const { attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [stage, setStage] = useState('photo') // photo → upload → recognize → form
  const [preview, setPreview] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [item, setItem] = useState(EMPTY_ITEM)
  const [auto, setAuto] = useState({}) // какие поля предзаполнило распознавание
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Локальный адрес превью освобождаем, когда он больше не нужен
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (!getToken()) return <Navigate to="/login" replace />

  const busy = stage === 'upload' || stage === 'recognize'

  async function handleFile(file) {
    setPhotoError('')
    setPreview(URL.createObjectURL(file))
    setStage('upload')
    let uploaded
    try {
      uploaded = await uploadPhoto(file)
      setPhoto(uploaded)
    } catch (err) {
      // 413 и 415 — текст из api/photos.js: «Фото больше 10 МБ — выберите поменьше», «Подойдёт фото в JPEG, PNG или WebP»
      setPhotoError(err.message)
      setPreview(null)
      setStage('photo')
      return
    }
    // Первое распознавание после старта бэка — около 20 секунд: на экране чек-лист со спиннером, а не «зависло»
    setStage('recognize')
    try {
      const r = await recognizeItem(uploaded.id)
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
    setPhotoError('')
    setAuto({})
    setStage('photo')
  }

  async function save() {
    setError('')
    setFieldErrors({})
    setSaving(true)
    try {
      const created = await createItem({ ...item, name: item.name.trim(), photo_id: photo?.id })
      // Гардероб покажет уведомление «добавлена» (макет 3.7)
      navigate('/wardrobe', { replace: true, state: { added: created.name } })
    } catch (err) {
      if (err.fields) setFieldErrors(itemFieldErrors(err.fields))
      else setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <ScreenHeader
        title="Новая вещь"
        onBack={() => (stage === 'form' ? retake() : navigate('/wardrobe', { replace: true }))}
        backDisabled={busy}
        right={stage === 'form' ? '2 / 2' : '1 / 2'}
      />

      {stage === 'photo' && <PhotoStep onFile={handleFile} onManual={manual} error={photoError} />}

      {busy && <RecognizingStep preview={preview} stage={stage} />}

      {stage === 'form' && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {(auto.category || auto.color) && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h2" sx={{ mb: 0.5 }}>Заполнили автоматически</Typography>
              <Typography sx={{ color: 'text.secondary' }}>Проверьте поля — любое можно исправить</Typography>
            </Box>
          )}

          {preview && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box
                component="img"
                src={preview}
                alt=""
                sx={{ width: 88, height: 88, objectFit: 'cover', borderRadius: '16px', display: 'block' }}
              />
              <Button variant="outlined" onClick={retake}>Переснять фото</Button>
            </Box>
          )}

          {attrs && (
            <ItemForm
              attrs={attrs}
              value={item}
              onChange={setItem}
              auto={auto}
              errors={fieldErrors}
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
              <Typography sx={{ color: 'text.secondary' }}>{attrsError}</Typography>
              <Button variant="outlined" onClick={retryAttrs}>Повторить</Button>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
