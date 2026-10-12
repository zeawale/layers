import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'

import { getToken } from '../api/client.js'
import { createItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm, { EMPTY_ITEM, itemFieldErrors } from '../components/ItemForm.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import useAttributes from '../hooks/useAttributes.js'
import PhotoStep from './wardrobe/PhotoStep.jsx'

// Добавление вещи — макеты 3.4 «Фото» → 3.6 «Проверка полей», после сохранения — гардероб (3.7)
export default function AddItem() {
  const navigate = useNavigate()
  const { attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [stage, setStage] = useState('photo') // photo → form
  const [preview, setPreview] = useState(null)
  const [photo, setPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [item, setItem] = useState(EMPTY_ITEM)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [saving, setSaving] = useState(false)

  // Локальный адрес превью освобождаем, когда он больше не нужен
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  if (!getToken()) return <Navigate to="/login" replace />

  async function handleFile(file) {
    setPhotoError('')
    setUploading(true)
    try {
      setPhoto(await uploadPhoto(file))
      setPreview(URL.createObjectURL(file))
      setStage('form')
    } catch (err) {
      // 413 и 415 — текст из api/photos.js: «Фото больше 10 МБ — выберите поменьше», «Подойдёт фото в JPEG, PNG или WebP»
      setPhotoError(err.message)
    } finally {
      setUploading(false)
    }
  }

  function manual() {
    setPhoto(null)
    setPreview(null)
    setStage('form')
  }

  function retake() {
    setPhoto(null)
    setPreview(null)
    setPhotoError('')
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
        backDisabled={uploading}
        right={stage === 'form' ? '2 / 2' : '1 / 2'}
      />

      {stage === 'photo' && <PhotoStep onFile={handleFile} onManual={manual} uploading={uploading} error={photoError} />}

      {stage === 'form' && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
