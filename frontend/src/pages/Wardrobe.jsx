import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, IconButton, InputAdornment, TextField, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'

import { listItems } from '../api/items.js'
import { mediaUrl } from '../api/client.js'
import LoadError from '../components/LoadError.jsx'
import Loading from '../components/Loading.jsx'
import Notice from '../components/Notice.jsx'
import PhotoCard from '../components/PhotoCard.jsx'
import useAttributes from '../hooks/useAttributes.js'
import EmptyWardrobe from './wardrobe/EmptyWardrobe.jsx'

// «42 вещи», «1 вещь», «5 вещей»
function itemsWord(n) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'вещь'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'вещи'
  return 'вещей'
}

// Поиск без учёта регистра и «ё»: «черн» находит «Чёрные джинсы»
const normalize = (s) => s.toLowerCase().replaceAll('ё', 'е')

// Макеты 3.0 «Гардероб», 3.1 «Гардероб · пусто», 3.8 «Ничего не нашлось»
export default function Wardrobe() {
  const navigate = useNavigate()
  const addItem = () => navigate('/wardrobe/new')
  const { label, loading: attrsLoading, error: attrsError, retry: retryAttrs } = useAttributes()
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [query, setQuery] = useState('')

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

  const failed = error || attrsError
  const loading = !failed && (items === null || attrsLoading)
  // Поиск по названию — у себя, список уже загружен целиком (API.md, GET /items)
  const q = normalize(query.trim())
  const shown = items?.filter((item) => normalize(item.name).includes(q)) ?? []

  return (
    <Box sx={{ px: 3, pt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h1">Гардероб</Typography>
        {items?.length > 0 && (
          <IconButton
            onClick={addItem}
            aria-label="Добавить вещь"
            sx={{ bgcolor: 'primary.main', color: 'common.white', width: 44, height: 44, '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>
      {/* Счётчик — только когда список загружен: до этого «Пока ни одной вещи» было бы неправдой */}
      <Typography sx={{ color: 'text.secondary', mb: 3, minHeight: '1.5em' }}>
        {items && (items.length ? `${items.length} ${itemsWord(items.length)} в гардеробе` : 'Пока ни одной вещи')}
      </Typography>

      {loading && <Loading />}

      {failed && <LoadError message={failed} onRetry={retry} />}

      {!loading && !failed && items.length === 0 && <EmptyWardrobe onAdd={addItem} />}

      {!loading && !failed && items.length > 0 && (
        <>
          <TextField
            placeholder="Поиск по названию"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
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

          {shown.length > 0 ? (
            // minmax(0, 1fr): длинное название не раздвигает колонку шире экрана
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, pb: 2 }}>
              {shown.map((item) => (
                <PhotoCard
                  key={item.id}
                  image={mediaUrl(item.photo?.url)}
                  title={item.name}
                  subtitle={`${label('category', item.category)} · ${label('color', item.color).toLowerCase()}`}
                  onClick={() => navigate(`/wardrobe/${item.id}`)}
                />
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="h2" sx={{ mb: 1 }}>Ничего не нашлось</Typography>
              <Typography sx={{ color: 'text.secondary', mb: 3 }}>Попробуйте другое название.</Typography>
              <Button variant="outlined" onClick={() => setQuery('')}>Очистить поиск</Button>
            </Box>
          )}
        </>
      )}

      {/* «Вещь в гардеробе» после добавления (макет 3.7), «Удалили …» после удаления */}
      <Notice />
    </Box>
  )
}
