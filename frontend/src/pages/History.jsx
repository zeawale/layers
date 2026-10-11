import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { mediaUrl } from '../api/client.js'
import { getHistory } from '../api/outfit.js'
import { conditionLabel, formatDayShort, formatTemp } from '../format.js'

const RATING_LABEL = { like: 'понравился', dislike: 'не понравился' }

function Thumb({ item }) {
  const photo = mediaUrl(item.photo?.url)
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        borderRadius: '10px',
        bgcolor: 'background.default',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        flexShrink: 0,
      }}
    >
      {photo ? (
        <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <CheckroomOutlined sx={{ fontSize: 22 }} />
      )}
    </Box>
  )
}

// Макет «История»: последние комплекты по дням, новые сверху (GET /outfit/history, 30 дней)
export default function History() {
  const navigate = useNavigate()
  const [outfits, setOutfits] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setError('')
    getHistory()
      .then((data) => setOutfits(data.outfits))
      .catch((err) => setError(err.message))
  }, [attempt])

  return (
    <Box sx={{ px: 3, pt: 4 }}>
      <Typography variant="h1" sx={{ mb: 0.5 }}>История</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15 }}>Что вы носили и когда</Typography>

      {error && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
          <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
          <Button variant="outlined" onClick={() => setAttempt((n) => n + 1)}>Повторить</Button>
        </Box>
      )}

      {!error && !outfits && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress size={28} /></Box>
      )}

      {outfits?.length === 0 && (
        <Typography sx={{ color: 'text.secondary', fontSize: 15, textAlign: 'center', py: 6 }}>
          Пока пусто. Комплекты появятся здесь, как только сервис соберёт первый.
        </Typography>
      )}

      {outfits?.length > 0 && (
        <>
          <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 1.5 }}>Последние комплекты</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pb: 2 }}>
            {outfits.map((o) => (
              <Box
                key={o.id}
                onClick={() => navigate(`/history/${o.id}`)}
                sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: 2, cursor: 'pointer' }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.25 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{formatDayShort(o.date)}</Typography>
                  {o.feedback?.rating && (
                    <Typography
                      variant="body2"
                      sx={{ color: o.feedback.rating === 'like' ? 'success.main' : 'secondary.main', fontWeight: 600 }}
                    >
                      {RATING_LABEL[o.feedback.rating]}
                    </Typography>
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: o.items.length ? 1.5 : 0 }}>
                  {formatTemp(o.weather.temp_min)} · {conditionLabel(o.weather.condition)}
                  {o.feedback?.worn ? ' · надет' : ''}
                </Typography>
                {o.items.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, overflow: 'hidden' }}>
                    {o.items.map((item) => <Thumb key={item.id} item={item} />)}
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
