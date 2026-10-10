import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckIcon from '@mui/icons-material/Check'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SearchIcon from '@mui/icons-material/Search'

import { api } from '../api/client.js'

const COLOR_HEX = {
  black: '#1c1b18', white: '#ffffff', gray: '#9e9e9e', beige: '#d4c5a9',
  brown: '#6d4c30', navy: '#1a237e', blue: '#1565c0', light_blue: '#64b5f6',
  green: '#388e3c', khaki: '#827717', yellow: '#fdd835', orange: '#ef6c00',
  red: '#c62828', maroon: '#6a1b34', pink: '#e91e90',
  multicolor: 'conic-gradient(red, orange, yellow, green, blue, violet, red)',
}

// Описания карточек стилей. Названия и сам список берём из GET /attributes,
// порядок — как в макете: стиль, которого нет в словаре, идёт в конец.
const STYLE_DESC = {
  casual: 'Удобно каждый день',
  sport: 'Движение и комфорт',
  business: 'Строго — для работы и учёбы',
}
const STYLE_ORDER = Object.keys(STYLE_DESC)

function styleRank(value) {
  const i = STYLE_ORDER.indexOf(value)
  return i === -1 ? STYLE_ORDER.length : i
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [style, setStyle] = useState(null)
  const [liked, setLiked] = useState([])
  const [disliked, setDisliked] = useState([])
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [colors, setColors] = useState([])
  const [styles, setStyles] = useState([])
  const debounceRef = useRef(null)

  useEffect(() => {
    api('/attributes').then((data) => {
      if (data.color) setColors(data.color)
      if (data.style) setStyles([...data.style].sort((a, b) => styleRank(a.value) - styleRank(b.value)))
    }).catch(() => {})
  }, [])

  const searchCities = useCallback((q) => {
    if (q.length < 3) { setCities([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      api(`/geo/cities?q=${encodeURIComponent(q)}`)
        .then((data) => setCities(data.cities || []))
        .catch(() => setCities([]))
    }, 300)
  }, [])

  function handleCityInput(val) {
    setCityQuery(val)
    setSelectedCity(null)
    searchCities(val)
  }

  function selectCity(city) {
    setSelectedCity(city)
    setCityQuery(city.name)
    setCities([])
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCity({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setCityQuery('Определяем…')
      },
      () => setError('Не удалось определить местоположение'),
    )
  }

  async function finish() {
    setError('')
    setLoading(true)
    try {
      const body = { preferences: {} }
      if (style) body.preferences.style = style
      if (liked.length) body.preferences.liked_colors = liked
      if (disliked.length) body.preferences.disliked_colors = disliked
      if (selectedCity?.lat != null && selectedCity?.lon != null) {
        body.lat = selectedCity.lat
        body.lon = selectedCity.lon
        if (selectedCity.name) body.city = selectedCity.name
      } else if (cityQuery.trim()) {
        body.city = cityQuery.trim()
      }
      await api('/users/me', { method: 'PATCH', body: JSON.stringify(body) })
      navigate('/today')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function toggleColor(list, setList, color) {
    if (list.includes(color)) setList(list.filter((c) => c !== color))
    else setList([...list, color])
  }

  function next() {
    if (step < 2) setStep(step + 1)
    else finish()
  }

  function back() {
    if (step > 0) setStep(step - 1)
    else navigate(-1)
  }

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 3,
      bgcolor: 'background.paper',
      '& fieldset': { borderColor: 'divider' },
    },
  }

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      {/* Навбар */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={back} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}>
          <ArrowBackIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', color: 'text.secondary' }}>
          Шаг {step + 1} из 3
        </Typography>
        {step < 2 ? (
          <Typography
            variant="body2"
            onClick={next}
            sx={{ cursor: 'pointer', color: 'text.secondary', minWidth: 80, textAlign: 'right' }}
          >
            Пропустить
          </Typography>
        ) : (
          <Box sx={{ minWidth: 80 }} />
        )}
      </Box>

      {/* Прогресс-бар */}
      <Box sx={{ display: 'flex', gap: 0.75, mb: 3 }}>
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: i <= step ? 'primary.main' : 'divider',
            }}
          />
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Шаг 1: Стиль */}
      {step === 0 && (
        <>
          <Typography variant="h2" sx={{ mb: 1 }}>Какой стиль вам ближе?</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15, lineHeight: 1.5 }}>
            Выберите стиль, который вам ближе. Дальше сервис будет учиться на ваших оценках.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 4 }}>
            {styles.map((s) => {
              const active = style === s.value
              return (
                <Box
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  sx={{
                    position: 'relative',
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: active ? 'primary.main' : 'divider',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                >
                  <Box sx={{ height: 104, bgcolor: 'divider', borderRadius: '10px 10px 0 0' }} />
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 0.25 }}>{s.label}</Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.4 }}>
                      {STYLE_DESC[s.value]}
                    </Typography>
                  </Box>
                  {active && (
                    <Box
                      sx={{
                        position: 'absolute', top: 10, right: 10,
                        width: 26, height: 26, borderRadius: '50%',
                        bgcolor: 'primary.main',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <CheckIcon sx={{ fontSize: 14, color: 'common.white' }} />
                    </Box>
                  )}
                </Box>
              )
            })}
          </Box>
        </>
      )}

      {/* Шаг 2: Цвета */}
      {step === 1 && (
        <>
          <Typography variant="h2" sx={{ mb: 1 }}>Любимые цвета</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15 }}>
            Отметьте цвета, которые носите и которые точно нет
          </Typography>

          {/* Люблю носить */}
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Люблю носить</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {liked.length} выбрано
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colors.map((c) => {
                const active = liked.includes(c.value)
                const dimmed = disliked.includes(c.value)
                return (
                  <Box
                    key={c.value}
                    onClick={() => { if (!dimmed) toggleColor(liked, setLiked, c.value) }}
                    title={c.label}
                    sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      cursor: dimmed ? 'default' : 'pointer',
                      position: 'relative',
                      background: COLOR_HEX[c.value] || '#ccc',
                      border: active ? '3px solid' : '1px solid',
                      borderColor: active ? 'primary.main' : 'divider',
                      opacity: dimmed ? 0.3 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {active && (
                      <CheckIcon
                        sx={{
                          fontSize: 18,
                          color: ['white', 'yellow', 'beige'].includes(c.value)
                            ? 'text.primary' : 'common.white',
                        }}
                      />
                    )}
                  </Box>
                )
              })}
            </Box>
          </Box>

          {/* Не ношу */}
          <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 600, fontSize: 15 }}>Не ношу</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {disliked.length} выбрано
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {colors.map((c) => {
                const active = disliked.includes(c.value)
                const dimmed = liked.includes(c.value)
                return (
                  <Box
                    key={c.value}
                    onClick={() => { if (!dimmed) toggleColor(disliked, setDisliked, c.value) }}
                    title={c.label}
                    sx={{
                      width: 44, height: 44, borderRadius: '50%',
                      cursor: dimmed ? 'default' : 'pointer',
                      position: 'relative',
                      background: COLOR_HEX[c.value] || '#ccc',
                      border: active ? '3px solid' : '1px solid',
                      borderColor: active ? 'error.main' : 'divider',
                      opacity: dimmed ? 0.3 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {active && (
                      <CheckIcon
                        sx={{
                          fontSize: 18,
                          color: ['white', 'yellow', 'beige'].includes(c.value)
                            ? 'text.primary' : 'common.white',
                        }}
                      />
                    )}
                  </Box>
                )
              })}
            </Box>
          </Box>
        </>
      )}

      {/* Шаг 3: Город */}
      {step === 2 && (
        <>
          <Typography variant="h2" sx={{ mb: 1 }}>Ваш город</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15 }}>
            Чтобы учесть погоду при подборе комплекта
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
              Город
            </Typography>
            <TextField
              placeholder="Москва"
              value={cityQuery}
              onChange={(e) => handleCityInput(e.target.value)}
              fullWidth
              sx={fieldSx}
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
          </Box>

          {/* Подсказки городов */}
          {cities.length > 0 && (
            <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
              {cities.map((city, i) => (
                <Box
                  key={`${city.name}-${city.lat}-${city.lon}`}
                  onClick={() => selectCity(city)}
                  sx={{
                    display: 'flex', alignItems: 'center', gap: 1.5,
                    px: 2, py: 1.5, cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderBottom: i < cities.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                  }}
                >
                  <LocationOnOutlinedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{city.name}</Typography>
                    {(city.region || city.country) && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {[city.region, city.country].filter(Boolean).join(', ')}
                      </Typography>
                    )}
                  </Box>
                  {selectedCity?.name === city.name && (
                    <CheckIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                  )}
                </Box>
              ))}
            </Box>
          )}

          {/* Определить автоматически */}
          <Box
            onClick={handleGeolocate}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer' }}
          >
            <Box
              sx={{
                width: 36, height: 36, borderRadius: '50%',
                bgcolor: 'background.paper',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </Box>
            <Typography sx={{ fontSize: 15, color: 'text.secondary' }}>
              Определить автоматически
            </Typography>
          </Box>
        </>
      )}

      {/* Кнопка действия */}
      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={next}
        // Без города нет погоды, шаг города пропустить нельзя
        disabled={loading || (step === 2 && !selectedCity && !cityQuery.trim())}
      >
        {loading ? 'Сохраняем…' : step === 2 ? 'Готово' : 'Далее'}
      </Button>
    </Box>
  )
}
