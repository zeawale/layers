import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Box } from '@mui/material'

import { getToken } from '../api/client.js'
import { createItem, recognizeItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm, { EMPTY_ITEM, itemFieldErrors } from '../components/ItemForm.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import useAttributes from '../hooks/useAttributes.js'
import AutoCard from './wardrobe/AutoCard.jsx'
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
  // Экран закрыли (крестик во время загрузки) — распознавание уже не запускаем: первое грузит бэк секунд на 20
  const closed = useRef(false)
  useEffect(() => {
    closed.current = false // StrictMode в dev монтирует экран дважды
    return () => { closed.current = true }
  }, [])

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
      // 413 и 415 — текст из api/photos.js: «Фото больше 10 МБ — выбери поменьше», «Подойдёт фото в JPEG, PNG или WebP»
      setPhotoError(err.message)
      setPreview(null)
      setStage('photo')
      return
    }
    if (closed.current) return
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
      navigate('/wardrobe', { replace: true, state: { notice: `«${created.name}» в гардеробе` } })
    } catch (err) {
      if (err.fields) setFieldErrors(itemFieldErrors(err.fields))
      else setError(err.message)
      setSaving(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <ScreenHeader
        title="Новая вещь"
        // Крестик на всех шагах (3.4–3.6) — выйти из добавления; вернуться к фото — «Переснять фото»
        close
        onBack={() => navigate('/wardrobe', { replace: true })}
        right={stage === 'form' ? '2 / 2' : '1 / 2'}
      />

      {stage === 'photo' && <PhotoStep onFile={handleFile} onManual={manual} error={photoError} />}

      {busy && <RecognizingStep preview={preview} stage={stage} />}

      {stage === 'form' && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {preview && <AutoCard src={preview} auto={auto.category || auto.color} onRetake={retake} />}

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
          {!attrs && !attrsError && <Loading />}
          {attrsError && <LoadError message={attrsError} onRetry={retryAttrs} />}
        </>
      )}
    </Box>
  )
}
