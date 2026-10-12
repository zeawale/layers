import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'

import { getHistory } from '../api/outfit.js'
import IconCircle from '../components/IconCircle.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import NoConnection from '../components/NoConnection.jsx'
import Panel from '../components/Panel.jsx'
import HistoryRow from './history/HistoryRow.jsx'

// Макет 4.0 «История» (тексты на «ты», HANDBOOK, раздел 8; подзаголовок без рода — «носил/носила» не знаем): последние комплекты по дням, новые сверху (GET /outfit/history — 30 дней,
// по одному выбранному комплекту на день, сегодняшний тоже). Календаря и счётчиков нет — «Идеи на будущее»
export default function History() {
  const navigate = useNavigate()
  const [outfits, setOutfits] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setError(null)
    getHistory()
      .then((data) => setOutfits(data.outfits))
      .catch(setError)
  }, [attempt])

  const retry = () => setAttempt((n) => n + 1)
  if (error?.offline) return <NoConnection onRetry={retry} />

  return (
    <Box sx={{ px: 3, pt: 2.5 }}>
      <Typography variant="h1">История</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: -0.5, mb: 2.375 }}>Твои комплекты по дням</Typography>

      {error && <LoadError message={error.message} onRetry={retry} />}
      {!error && !outfits && <Loading />}

      {outfits?.length === 0 && (
        <Panel sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <IconCircle tone="neutral" sx={{ mb: 2.5 }}><CalendarMonthOutlined /></IconCircle>
          <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>Пока пусто</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>Здесь появятся комплекты по дням — начиная с сегодняшнего.</Typography>
          <Button variant="contained" size="large" fullWidth onClick={() => navigate('/today')}>К комплекту дня</Button>
        </Panel>
      )}

      {outfits?.length > 0 && (
        <>
          <Typography variant="h3" component="h2" sx={{ mb: 1.25 }}>Последние комплекты</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, pb: 2 }}>
            {outfits.map((o) => <HistoryRow key={o.id} outfit={o} onClick={() => navigate(`/history/${o.id}`)} />)}
          </Box>
        </>
      )}
    </Box>
  )
}
