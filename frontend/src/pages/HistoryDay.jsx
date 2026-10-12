import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'

import { getHistory } from '../api/outfit.js'
import Explanation from '../components/Explanation.jsx'
import FeedbackBar from '../components/FeedbackBar.jsx'
import IconCircle from '../components/IconCircle.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import NoConnection from '../components/NoConnection.jsx'
import OutfitGrid from '../components/OutfitGrid.jsx'
import Panel from '../components/Panel.jsx'
import ScreenHeader from '../components/ScreenHeader.jsx'
import Toast from '../components/Toast.jsx'
import { formatDayLong } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'
import useFeedback from '../hooks/useFeedback.jsx'
import RatingNote from './history/RatingNote.jsx'
import WeatherChip from './history/WeatherChip.jsx'

// Макеты 4.1 «История · прошлый день» и 4.1a «без отметки». Отдельного GET /outfit/{id} в API нет —
// берём день из истории (те же 30 дней, что в списке)
export default function HistoryDay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { label, attrs, error: attrsError, retry: retryAttrs } = useAttributes()
  const [outfit, setOutfit] = useState(undefined) // undefined — грузится, null — такого дня в истории нет
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)
  const [editing, setEditing] = useState(false) // поменять уже поставленную оценку
  const [toast, setToast] = useState(null)
  const feedback = useFeedback((u) => { setOutfit(u); setEditing(false) }, setToast)

  useEffect(() => {
    setError(null)
    getHistory()
      .then((data) => setOutfit(data.outfits.find((o) => String(o.id) === id) ?? null))
      .catch(setError)
  }, [id, attempt])

  const retry = () => { setAttempt((n) => n + 1); retryAttrs() }
  const toList = () => navigate('/history')
  if (error?.offline) return <NoConnection onRetry={retry} />
  const failed = error?.message || attrsError

  return (
    <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
      <ScreenHeader title="Комплект дня" muted onBack={toList} />

      {failed && <LoadError message={failed} onRetry={retry} />}
      {!failed && (outfit === undefined || !attrs) && <Loading />}

      {!failed && outfit === null && (
        <Panel sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <IconCircle tone="neutral" sx={{ mb: 2.5 }}><CalendarMonthOutlined /></IconCircle>
          <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>Этого дня нет в истории</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>История хранит последние 30 дней.</Typography>
          <Button variant="contained" size="large" fullWidth onClick={toList}>К истории</Button>
        </Panel>
      )}

      {!failed && outfit && attrs && (
        <>
          <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>{formatDayLong(outfit.date)}</Typography>
          <WeatherChip weather={outfit.weather} />
          {/* Удалённые вещи из прошлых комплектов пропадают — плиток может быть меньше, чем было */}
          {outfit.items.length > 0 && (
            <Panel shadow sx={{ p: 1.5, mb: 2.5 }}>
              <OutfitGrid items={outfit.items} label={label} />
            </Panel>
          )}
          <Explanation title="Почему был этот комплект" text={outfit.explanation} />
          {outfit.feedback?.rating && !editing ? (
            <RatingNote feedback={outfit.feedback} onEdit={() => setEditing(true)} />
          ) : (
            <FeedbackBar
              past
              feedback={outfit.feedback}
              busy={feedback.busy}
              onRate={(rating) => feedback.rate(outfit, rating)}
              onWorn={() => feedback.toggleWorn(outfit)}
            />
          )}
        </>
      )}

      <Toast {...toast} onClose={() => setToast(null)} />
    </Box>
  )
}
