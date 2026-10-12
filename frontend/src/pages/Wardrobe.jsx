import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box } from '@mui/material'

import { bulkDeleteItems, listItems } from '../api/items.js'
import { mediaUrl } from '../api/client.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import Notice from '../components/Notice.jsx'
import PhotoCard from '../components/PhotoCard.jsx'
import { plural } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'
import DeleteBar from './wardrobe/DeleteBar.jsx'
import EmptyWardrobe from './wardrobe/EmptyWardrobe.jsx'
import NothingFound from './wardrobe/NothingFound.jsx'
import SearchRow from './wardrobe/SearchRow.jsx'
import WardrobeHeader from './wardrobe/WardrobeHeader.jsx'

// Поиск без учёта регистра и «ё»: «черн» находит «Чёрные джинсы»
const normalize = (s) => s.toLowerCase().replaceAll('ё', 'е')
// Больше за один запрос bulk-delete не принимает (API.md)
const MAX_SELECTED = 100
const ITEMS = ['вещь', 'вещи', 'вещей']

// Макеты 3.0 «Гардероб», 3.1 «пусто», 3.8 «ничего не нашлось», 3.10 «выбор», 3.11 «удалить выбранные»
export default function Wardrobe() {
  const navigate = useNavigate()
  const addItem = () => navigate('/wardrobe/new')
  const { label, loading: attrsLoading, error: attrsError, retry: retryAttrs } = useAttributes()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null) // null — не в режиме выбора, иначе id выбранных
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    setError('')
    listItems()
      .then((data) => {
        setItems(data.items)
        if (!data.items.length) setSelected(null)
      })
      .catch((err) => setError(err.message))
  }, [attempt])

  function retry() {
    setAttempt((n) => n + 1)
    retryAttrs()
  }

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length < MAX_SELECTED ? [...s, id] : s))
  }

  async function deleteSelected() {
    setDeleteError('')
    setDeleting(true)
    try {
      await bulkDeleteItems(selected)
      setItems((list) => list.filter((i) => !selected.includes(i.id)))
      setConfirmOpen(false)
      // Уведомление показывает Notice — так же, как после удаления одной вещи
      navigate('.', { replace: true, state: { notice: `Удалили ${selected.length} ${plural(selected.length, ITEMS)}` } })
      setSelected(null)
    } catch (err) {
      // Всё или ничего: не удалилась ни одна. 404 — часть вещей уже удалили в другой вкладке: обновляем список
      if (err.status === 404) {
        setConfirmOpen(false)
        setDeleteError('Часть вещей уже удалена. Список обновили — выберите вещи ещё раз')
        setSelected([])
        setAttempt((n) => n + 1)
      } else setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  // Вещей не осталось — выбирать нечего, режим выбора не показываем
  const selecting = selected !== null && items?.length > 0
  const count = selecting ? selected.length : 0
  const failed = error || attrsError
  const loading = !failed && (items === null || attrsLoading)
  // Поиск по названию — у себя, список уже загружен целиком (API.md, GET /items)
  const q = normalize(query.trim())
  const shown = items?.filter((item) => normalize(item.name).includes(q)) ?? []

  return (
    <Box sx={{ px: 3, pt: 4 }}>
      <WardrobeHeader
        total={items?.length ?? null}
        selected={selecting ? selected : null}
        max={MAX_SELECTED}
        onAdd={addItem}
        onDone={() => setSelected(null)}
      />

      {deleteError && !confirmOpen && <Alert severity="warning" sx={{ mb: 2 }}>{deleteError}</Alert>}

      {loading && <Loading />}

      {failed && <LoadError message={failed} onRetry={retry} />}

      {!loading && !failed && items.length === 0 && <EmptyWardrobe onAdd={addItem} />}

      {!loading && !failed && items.length > 0 && (
        <>
          <SearchRow
            query={query}
            onChange={setQuery}
            onSelect={selecting ? null : () => { setDeleteError(''); setSelected([]) }}
          />

          {shown.length > 0 ? (
            // minmax(0, 1fr): длинное название не раздвигает колонку шире экрана.
            // В режиме выбора снизу место под «Удалить (N)», чтобы кнопка не закрывала последние карточки
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, pb: count ? 9 : 2 }}>
              {shown.map((item) => (
                <PhotoCard
                  key={item.id}
                  image={mediaUrl(item.photo?.url)}
                  title={item.name}
                  subtitle={`${label('category', item.category)} · ${label('color', item.color).toLowerCase()}`}
                  selected={selecting && selected.includes(item.id)}
                  onClick={() => (selecting ? toggle(item.id) : navigate(`/wardrobe/${item.id}`))}
                />
              ))}
            </Box>
          ) : (
            <NothingFound onClear={() => setQuery('')} />
          )}
        </>
      )}

      {count > 0 && <DeleteBar count={count} onClick={() => { setDeleteError(''); setConfirmOpen(true) }} />}

      <ConfirmDialog
        open={confirmOpen}
        title={`Удалить ${count} ${plural(count, ITEMS)}?`}
        text="Вещи пропадут из гардероба и больше не попадут в комплекты."
        loading={deleting}
        error={deleteError}
        onConfirm={deleteSelected}
        onClose={() => { setConfirmOpen(false); setDeleteError('') }}
      />

      {/* «Вещь в гардеробе» после добавления (макет 3.7), «Удалили …» после удаления */}
      <Notice />
    </Box>
  )
}
