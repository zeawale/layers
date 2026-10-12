import { Button, Typography } from '@mui/material'
import FilterDramaOutlined from '@mui/icons-material/FilterDramaOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'

import IconCircle from '../../components/IconCircle.jsx'
import Panel from '../../components/Panel.jsx'

// Макет 2.10 «Сегодня · нет прогноза» — 502, Open-Meteo не ответил
export default function ForecastError({ onRetry }) {
  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <IconCircle tone="secondary" sx={{ mb: 2 }}><FilterDramaOutlined /></IconCircle>
      <Typography variant="h4" component="h2" sx={{ mb: 2 }}>Не удалось получить прогноз, попробуйте позже</Typography>
      <Button variant="contained" size="large" fullWidth startIcon={<RefreshIcon />} onClick={onRetry}>
        Попробовать снова
      </Button>
    </Panel>
  )
}
