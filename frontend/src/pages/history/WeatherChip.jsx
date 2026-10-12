import { Box, Typography } from '@mui/material'

import WeatherIcon from '../../components/WeatherIcon.jsx'
import { conditionText, formatTemp } from '../../format.js'

// Погода того дня одной строкой на голубой «таблетке» (макет 4.1): «+14° · облачно · ветер 3 м/с»
export default function WeatherChip({ weather }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, height: 34, px: 1.5, borderRadius: 999, bgcolor: 'weather.sky', mb: 2.5 }}>
      <WeatherIcon condition={weather.condition} sx={{ width: 20, height: 20 }} />
      <Typography variant="body2">
        {formatTemp(weather.temp_min)} · {conditionText(weather.condition)} · ветер {Math.round(weather.wind_speed)} м/с
      </Typography>
    </Box>
  )
}
