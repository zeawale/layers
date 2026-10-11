import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, IconButton, Snackbar, Typography } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

import { getHistory, sendFeedback } from '../api/outfit.js'
import FeedbackBar from '../components/FeedbackBar.jsx'
import OutfitGrid from '../components/OutfitGrid.jsx'
import { conditionLabel, formatDayLong, formatTemp } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'

// Макет «Комплект дня» из истории. Отдельного GET /outfit/{id} нет — берём день из истории.
// Оценить и отметить «надет» можно любой свой комплект, в том числе вчерашний (API.md, feedback).
export default function HistoryDay() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { label, error: attrsError, retry: retryAttrs } = useAttributes()
  const [outfit, setOutfit] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    setError('')
    getHistory()
      .then((data) => {
        const found = data.outfits.find((o) => String(o.id) === id)
        if (found) setOutfit(found)
        else setError('Комплект не найден')
      })
      .catch((err) => setError(err.message))
  }, [id, attempt])

  async function feedback(changes) {
    setBusy(true)
    try {
      setOutfit(await sendFeedback(outfit.id, changes))
    } catch (err) {
      setNotice(err.message)
    } finally {
      setBusy(false)
    }
  }

  const failed = error || attrsError
  const w = outfit?.weather
  const rating = outfit?.feedback?.rating

  return (
    <Box sx={{ px: 3, pt: 2, pb: 2 }}>
      <IconButton
        onClick={() => navigate('/history')}
        sx={{ ml: -1, mb: 2, border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}
      >
        <ArrowBackIcon sx={{ fontSize: 20 }} />
      </IconButton>

      {failed && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Alert severity="error" sx={{ width: '100%' }}>{failed}</Alert>
          <Button variant="outlined" onClick={() => { setAttempt((n) => n + 1); retryAttrs() }}>Повторить</Button>
        </Box>
      )}

      {!failed && !outfit && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      )}

      {!failed && outfit && (
        <>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Комплект дня</Typography>
          <Typography variant="h1" sx={{ mb: 1 }}>{formatDayLong(outfit.date)}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: 3 }}>
            {formatTemp(w.temp_min)} · {conditionLabel(w.condition)} · ветер {Math.round(w.wind_speed)} м/с
          </Typography>

          {outfit.items.length > 0 ? (
            <OutfitGrid outfit={outfit} label={label} />
          ) : (
            // Вещи этого дня потом удалили из гардероба — сам день в истории остаётся (API.md, DELETE /items)
            <Typography sx={{ color: 'text.secondary', fontSize: 15 }}>Вещей этого комплекта больше нет в гардеробе.</Typography>
          )}

          <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2.5, my: 3 }}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 1 }}>Почему был этот комплект</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.55 }}>{outfit.explanation}</Typography>
          </Box>

          {rating && (
            <Typography variant="body2" align="center" sx={{ color: 'text.secondary', mb: 1.5 }}>
              Вы отметили: {rating === 'like' ? 'нравится' : 'не нравится'}
            </Typography>
          )}
          <FeedbackBar
            feedback={outfit.feedback}
            busy={busy}
            today={false}
            onRate={(value) => feedback({ rating: value })}
            onWorn={(value) => feedback({ worn: value })}
          />
        </>
      )}

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
