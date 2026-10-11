import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, IconButton, Snackbar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { getToday, regenerate, selectVariant, sendFeedback } from '../api/outfit.js'
import { getMe } from '../api/users.js'
import useAttributes from '../hooks/useAttributes.js'
import FeedbackBar from './today/FeedbackBar.jsx'
import OutfitGrid from './today/OutfitGrid.jsx'
import WeatherCard from './today/WeatherCard.jsx'

function greeting(name) {
  const h = new Date().getHours()
  const part = h < 5 ? 'Доброй ночи' : h < 12 ? 'Доброе утро' : h < 17 ? 'Добрый день' : h < 23 ? 'Добрый вечер' : 'Доброй ночи'
  // Без имени — просто «Доброе утро» (API.md, User.name)
  return name ? `${part}, ${name}` : part
}

function today() {
  const s = new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// Главный экран — макеты 2.0–2.4, 2.8–2.10. Все действия отвечают OutfitDay, экран перерисовывается из ответа.
export default function Today() {
  const navigate = useNavigate()
  const { label, error: attrsError, retry: retryAttrs } = useAttributes()
  const [day, setDay] = useState(null)
  const [name, setName] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('') // ошибки действий (409, 429) — всплывающей строкой
  const [thanks, setThanks] = useState(false)

  useEffect(() => {
    setError('')
    getMe().then((u) => setName(u.name)).catch(() => {})
    getToday()
      .then(setDay)
      .catch((err) => {
        // 400 — нет города в профиле: ведём на шаг города (API.md, GET /outfit/today)
        if (err.status === 400) navigate('/onboarding', { replace: true })
        else setError(err.message)
      })
  }, [attempt, navigate])

  async function run(action) {
    setBusy(true)
    try {
      setDay(await action())
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function feedback(outfit, changes) {
    setBusy(true)
    try {
      const updated = await sendFeedback(outfit.id, changes)
      setDay((d) => ({ ...d, variants: d.variants.map((v) => (v.id === updated.id ? updated : v)) }))
      if (changes.rating) setThanks(true)
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  const header = (
    <>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>{today()}</Typography>
      <Typography variant="h1" sx={{ mb: 3 }}>{greeting(name)}</Typography>
    </>
  )

  const failed = error || attrsError
  if (failed) {
    return (
      <Box sx={{ px: 3, pt: 4 }}>
        {header}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>{failed}</Typography>
          <Button variant="contained" onClick={() => { setAttempt((n) => n + 1); retryAttrs() }}>Попробовать снова</Button>
        </Box>
      </Box>
    )
  }

  if (!day) {
    return (
      <Box sx={{ px: 3, minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <CircularProgress size={28} />
        <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>Смотрим прогноз и собираем комплект…</Typography>
      </Box>
    )
  }

  const outfit = day.variants.find((v) => v.id === day.selected_id)
  const index = day.variants.indexOf(outfit)
  const worn = Boolean(outfit.feedback?.worn)
  const canMore = day.variants.length < day.variants_max
  const empty = outfit.items.length === 0

  return (
    <Box sx={{ px: 3, pt: 4, pb: 2 }}>
      {header}
      <WeatherCard weather={outfit.weather} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Комплект на сегодня</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label="Предыдущий вариант"
            disabled={busy || worn || index === 0}
            onClick={() => run(() => selectVariant(day.variants[index - 1].id))}
          >
            <ChevronLeftIcon />
          </IconButton>
          {/* «Вариант 2 из 3» — variant выбранного и variants_max (API.md, OutfitDay) */}
          <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 44, textAlign: 'center' }}>
            {outfit.variant} из {day.variants_max}
          </Typography>
          <IconButton
            size="small"
            aria-label="Следующий вариант"
            disabled={busy || worn || index === day.variants.length - 1}
            onClick={() => run(() => selectVariant(day.variants[index + 1].id))}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {empty ? (
        // Макет 2.9 «Сегодня · пустой гардероб»
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%', mx: 'auto', mb: 2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: (t) => alpha(t.palette.success.main, 0.14), color: 'success.main',
            }}
          >
            <CheckroomOutlined sx={{ fontSize: 28 }} />
          </Box>
          <Typography variant="h2" sx={{ mb: 1 }}>В гардеробе пока пусто</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: 3 }}>Добавьте вещи — и мы соберём комплект под погоду.</Typography>
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/wardrobe')}>Добавить вещи</Button>
        </Box>
      ) : (
        <>
          <OutfitGrid outfit={outfit} label={label} />
          {canMore && (
            <Button
              fullWidth
              disabled={busy || worn}
              onClick={() => run(regenerate)}
              sx={{ mt: 1.5, fontWeight: 700, color: 'text.primary' }}
            >
              {busy ? 'Собираем…' : 'Другой вариант'}
            </Button>
          )}

          <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2.5, my: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Почему этот комплект</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.55 }}>{outfit.explanation}</Typography>
          </Box>

          <FeedbackBar
            feedback={outfit.feedback}
            busy={busy}
            onRate={(rating) => feedback(outfit, { rating })}
            onWorn={(value) => feedback(outfit, { worn: value })}
          />
        </>
      )}

      {/* Вариант без вещей (собран, пока гардероб был пуст) — даём собрать новый, когда вещи появились */}
      {empty && canMore && (
        <Button fullWidth disabled={busy} onClick={() => run(regenerate)} sx={{ mt: 1.5, fontWeight: 700, color: 'text.primary' }}>
          {busy ? 'Собираем…' : 'Другой вариант'}
        </Button>
      )}

      {/* Лицензии Open-Meteo и OpenStreetMap требуют подписи (API.md, «Подписи источников данных») */}
      <Typography variant="body2" align="center" sx={{ color: 'text.disabled', fontSize: 11, mt: 4 }}>
        Погода и поиск городов: Open-Meteo.com. Город по координатам: © OpenStreetMap
      </Typography>

      <Snackbar
        open={thanks}
        autoHideDuration={3000}
        onClose={() => setThanks(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setThanks(false)}>
          Спасибо за оценку! Учтём это в следующих подборах
        </Alert>
      </Snackbar>
      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={4000}
        onClose={() => setNotice('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="warning" variant="filled" onClose={() => setNotice('')}>{notice}</Alert>
      </Snackbar>
    </Box>
  )
}
