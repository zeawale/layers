import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Alert, Box } from '@mui/material'

import { getToken, mediaUrl } from '../api/client.js'
import { getItem, updateItem } from '../api/items.js'
import { uploadPhoto } from '../api/photos.js'
import ItemForm, { EMPTY_ITEM, itemFieldErrors } from '../components/ItemForm.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import useAttributes from '../hooks/useAttributes.js'
import ItemMissing from './wardrobe/ItemMissing.jsx'
import PhotoEditCard from './wardrobe/PhotoEditCard.jsx'

const FIELDS = Object.keys(EMPTY_ITEM)

// Макет 3.9 «Редактировать вещь» — та же форма, что при добавлении; фото можно заменить или убрать
export default function EditItem() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const { attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [item, setItem] = useState(null)
  const [form, setForm] = useState(null)
  const [photo, setPhoto] = useState(null) // { id, url } — текущее фото, только что загруженное или null
  const [loadError, setLoadError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [photoError, setPhotoError] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadError(null)
    getItem(id)
      .then((data) => {
        setItem(data)
        setForm(Object.fromEntries(FIELDS.map((f) => [f, data[f]])))
        setPhoto(data.photo)
      })
      .catch(setLoadError)
  }, [id, attempt])

  if (!getToken()) return <Navigate to="/login" replace />

  const toItem = (state) => navigate(`/wardrobe/${id}`, { replace: true, state })

  async function replacePhoto(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы тот же файл можно было выбрать ещё раз
    if (!file) return
    setPhotoError('')
    setUploading(true)
    try {
      setPhoto(await uploadPhoto(file))
    } catch (err) {
      // 413 и 415 — текст из api/photos.js, показываем под фото
      setPhotoError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setError('')
    setFieldErrors({})
    // PATCH принимает только изменённые поля
    const changes = {}
    for (const f of FIELDS) {
      const value = f === 'name' ? form.name.trim() : form[f]
      if (JSON.stringify(value) !== JSON.stringify(item[f])) changes[f] = value
    }
    if ((photo?.id ?? null) !== (item.photo?.id ?? null)) changes.photo_id = photo?.id ?? null
    // Ничего не поменяли — просто возвращаемся к вещи, без запроса
    if (!Object.keys(changes).length) return toItem()
    setSaving(true)
    try {
      await updateItem(id, changes)
      toItem({ notice: 'Изменения сохранены' })
    } catch (err) {
      if (err.fields) setFieldErrors(itemFieldErrors(err.fields))
      else setError(err.message)
      setSaving(false)
    }
  }

  const missing = loadError?.status === 404 || loadError?.status === 403
  const failed = (!missing && loadError?.message) || attrsError

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <ScreenHeader title="Редактировать вещь" close onBack={() => toItem()} backDisabled={saving} />

      {missing && <ItemMissing onBack={() => navigate('/wardrobe', { replace: true })} />}

      {failed && <LoadError message={failed} onRetry={() => { setAttempt((n) => n + 1); retryAttrs() }} />}

      {!loadError && !failed && (!form || !attrs) && <Loading />}

      {!loadError && !failed && form && attrs && (
        <>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <PhotoEditCard
            src={mediaUrl(photo?.url)}
            hasPhoto={Boolean(photo)}
            uploading={uploading}
            disabled={uploading || saving}
            error={photoError}
            onPick={() => fileRef.current.click()}
            onRemove={() => setPhoto(null)}
          />
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={replacePhoto} />

          <ItemForm
            attrs={attrs}
            value={form}
            onChange={setForm}
            errors={fieldErrors}
            onSubmit={save}
            submitLabel="Сохранить"
            loading={saving}
            disabled={uploading}
          />
        </>
      )}
    </Box>
  )
}
