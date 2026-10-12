import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { listItems } from '../api/items.js'
import { getToday } from '../api/outfit.js'
import { getMe } from '../api/users.js'
import { LoadError } from '../components/LoadState.jsx'
import NoConnection from '../components/NoConnection.jsx'
import SourcesNote from '../components/SourcesNote.jsx'
import Toast from '../components/Toast.jsx'
import { formatTemp } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'
import useFeedback from '../hooks/useFeedback.jsx'
import EmptyWardrobeCard from './today/EmptyWardrobeCard.jsx'
import FirstOutfit from './today/FirstOutfit.jsx'
import ForecastError from './today/ForecastError.jsx'
import OutfitCard from './today/OutfitCard.jsx'
import TodayHeader from './today/TodayHeader.jsx'
import TodaySkeleton from './today/TodaySkeleton.jsx'
import useVariants from './today/useVariants.js'
import WeatherCard from './today/WeatherCard.jsx'

const STEP_MS = 700 // шаг «анимации» экрана первого подбора (1.7)

// Главный экран — макеты 2.0, 2.1, 2.4, 2.8–2.11, 2.13, после онбординга — 1.7 и 1.7b
export default function Today() {
  const navigate = useNavigate()
  const location = useLocation()
  const { attrs, label, error: attrsError, retry: retryAttrs } = useAttributes()
  const [me, setMe] = useState(null)
  const [day, setDay] = useState(null)
  const [wardrobeEmpty, setWardrobeEmpty] = useState(false)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  // Сразу после онбординга онбординг передаёт first — показываем 1.7 вместо скелетона.
  // Убираем из истории, чтобы при обновлении страницы экран подбора не появлялся снова
  const [first] = useState(Boolean(location.state?.first))
  const [tick, setTick] = useState(0)
  // Уведомление экрана: { text, hint, icon } — ошибки вариантов и оценки, «Спасибо за оценку!»
  const [toast, setToast] = useState(null)
  const notify = (t) => setToast(typeof t === 'string' ? { text: t } : t)
  const variants = useVariants(day, setDay, notify)
  // Ответ на оценку — один Outfit: подменяем его внутри OutfitDay
  const feedback = useFeedback((u) => setDay((d) => ({ ...d, variants: d.variants.map((v) => (v.id === u.id ? u : v)) })), notify)

  useEffect(() => {
    if (location.state?.first) navigate('.', { replace: true, state: null })
  }, [location.state, navigate])

  useEffect(() => {
    let active = true
    setError(null)
    const loadMe = getMe().then((u) => active && setMe(u))
    const loadDay = getToday().then(async (d) => {
      const outfit = d.variants.find((v) => v.id === d.selected_id)
      // Пустой items — или пустой гардероб (2.9), или не нашлось подходящего: это различает только гардероб
      const empty = outfit.items.length === 0 && (await listItems()).items.length === 0
      if (active) {
        setDay(d)
        setWardrobeEmpty(empty)
      }
    })
    Promise.all([loadMe, loadDay]).catch((err) => {
      if (!active) return
      // 400 — в профиле нет города: без него нет погоды, ведём на экран города
      if (err.status === 400) navigate('/onboarding', { replace: true, state: { step: 'city' } })
      else setError(err)
    })
    return () => { active = false }
  }, [attempt, navigate])

  const ready = Boolean(day && me && attrs)
  const failed = error ?? (attrsError ? { message: attrsError } : null)
  // Экран подбора держим, пока не отметили шаги и не показали полную полоску (1.7b)
  const showFirst = first && !failed && !(ready && tick >= 4)

  useEffect(() => {
    if (!showFirst) return
    const id = setInterval(() => setTick((t) => t + 1), STEP_MS)
    return () => clearInterval(id)
  }, [showFirst])

  function retry() {
    setAttempt((n) => n + 1)
    retryAttrs()
  }

  if (failed?.offline) return <NoConnection onRetry={retry} />

  const outfit = day?.variants.find((v) => v.id === day.selected_id)

  if (showFirst) {
    const w = outfit?.weather
    const style = me?.preferences?.style
    const steps = [
      `Погода: ${me?.city ?? 'твой город'}${w ? `, ${formatTemp(w.temp_min)}, ветер ${Math.round(w.wind_speed)} м/с` : ''}`,
      `Стиль: ${style && attrs ? label('style', style).toLowerCase() : 'любой'}`,
      'Сочетаем цвета и вещи',
      'Пишем объяснение',
    ]
    return <FirstOutfit steps={steps} done={ready && tick >= 3 ? steps.length : Math.min(tick, 2)} />
  }

  return (
    <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
      {!ready && !failed && <TodaySkeleton />}

      {(ready || failed) && <TodayHeader name={me?.name} />}

      {failed?.status === 502 && <ForecastError onRetry={retry} />}
      {failed && failed.status !== 502 && <LoadError message={failed.message} onRetry={retry} />}

      {ready && !failed && (
        <>
          <WeatherCard weather={outfit.weather} />
          {wardrobeEmpty
            ? <EmptyWardrobeCard onAdd={() => navigate('/wardrobe/new')} />
            : <OutfitCard day={day} outfit={outfit} label={label} variants={variants} feedback={feedback} />}
          <SourcesNote sx={{ mt: 1 }} />
        </>
      )}

      {/* 409 и 429 у «Другого варианта», ошибки переключения и оценки — текстом бэка как есть */}
      <Toast {...toast} onClose={() => setToast(null)} />
    </Box>
  )
}
