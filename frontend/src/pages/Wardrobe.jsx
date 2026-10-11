import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import { bulkDeleteItems, listItems } from '../api/items.js'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import ItemCard from '../components/ItemCard.jsx'
import useAttributes from '../hooks/useAttributes.js'
import EmptyWardrobe from './wardrobe/EmptyWardrobe.jsx'
import NothingFound from './wardrobe/NothingFound.jsx'

// «42 вещи», «1 вещь», «5 вещей»
function itemsWord(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'вещь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вещи'
  return 'вещей'
}

// Макеты 3.0 «Гардероб», 3.1 «пусто», 3.8 «ничего не нашлось», 3.10 «выбор», 3.11 «удалить выбранные»
export default function Wardrobe() {
  const navigate = useNavigate()
  const { label, loading: attrsLoading, error: attrsError, retry: retryAttrs } = useAttributes()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')
  const [selecting, setSelecting] = useState(false)
  const [selected, setSelected] = useState([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    setError('')
    listItems()
      .then((data) => setItems(data.items))
      .catch((err) => setError(err.message))
  }, [attempt])

  function retry() {
    setAttempt((n) => n + 1)
    retryAttrs()
  }

  function toggle(id) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function stopSelecting() {
    setSelecting(false)
    setSelected([])
  }

  async function deleteSelected() {
    setDeleteError('')
    setDeleting(true)
    try {
      // Всё или ничего: если хоть одной вещи нет, бэк не удалит ни одну (API.md)
      await bulkDeleteItems(selected)
      setItems((list) => list.filter((i) => !selected.includes(i.id)))
      setConfirmOpen(false)
      stopSelecting()
    } catch (err) {
      setDeleteError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const failed = error || attrsError
  const loading = !failed && (items === null || attrsLoading)
  // Поиск по названию — у себя, список уже загружен целиком (API.md, GET /items)
  const q = query.trim().toLowerCase()
  const shown = items?.filter((item) => item.name.toLowerCase().includes(q)) ?? []
  const count = selected.length

  return (
    <Box sx={{ px: 3, pt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h1">Гардероб</Typography>
        {selecting ? (
          <Button onClick={stopSelecting} sx={{ fontWeight: 700, color: 'text.primary' }}>Готово</Button>
        ) : items?.length > 0 && (
          <IconButton
            onClick={() => navigate('/wardrobe/new')}
            aria-label="Добавить вещь"
            sx={{ bgcolor: 'primary.main', color: 'common.white', width: 44, height: 44, '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>
      <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15 }}>
        {selecting
          ? `Выбрано: ${count}`
          : items?.length ? `${items.length} ${itemsWord(items.length)} в гардеробе` : 'Пока ни одной вещи'}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {failed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Alert severity="error" sx={{ width: '100%' }}>{failed}</Alert>
          <Button variant="outlined" onClick={retry}>Повторить</Button>
        </Box>
      )}

      {!loading && !failed && items.length === 0 && <EmptyWardrobe onAdd={() => navigate('/wardrobe/new')} />}

      {!loading && !failed && items.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <TextField
              placeholder="Поиск по названию"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            {!selecting && (
              <Button onClick={() => setSelecting(true)} sx={{ fontWeight: 700, color: 'text.primary', flexShrink: 0 }}>
                Выбрать
              </Button>
            )}
          </Box>

          {shown.length > 0 ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, pb: selecting ? 19 : 2 }}>
              {shown.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  subtitle={`${label('category', item.category)} · ${label('color', item.color).toLowerCase()}`}
                  selected={selecting ? selected.includes(item.id) : undefined}
                  onClick={() => (selecting ? toggle(item.id) : navigate(`/wardrobe/${item.id}`))}
                />
              ))}
            </Box>
          ) : (
            <NothingFound onClear={() => setQuery('')} />
          )}
        </>
      )}

      {/* «Удалить (N)» — над нижней панелью, пока идёт выбор */}
      {selecting && count > 0 && (
        <Box sx={{ position: 'fixed', left: 0, right: 0, bottom: 96, display: 'flex', justifyContent: 'center', px: 3, zIndex: 11 }}>
          <Button
            variant="contained"
            color="error"
            size="large"
            onClick={() => setConfirmOpen(true)}
            sx={{ width: '100%', maxWidth: 342 }}
          >
            Удалить ({count})
          </Button>
        </Box>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={`Удалить ${count} ${itemsWord(count)}?`}
        text="Вещи пропадут из гардероба и больше не попадут в комплекты."
        loading={deleting}
        error={deleteError}
        onConfirm={deleteSelected}
        onClose={() => setConfirmOpen(false)}
      />
    </Box>
  )
}
