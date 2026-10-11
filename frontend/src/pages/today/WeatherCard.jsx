import { Box, Typography } from '@mui/material'
import AcUnitOutlined from '@mui/icons-material/AcUnitOutlined'
import CloudOutlined from '@mui/icons-material/CloudOutlined'
import UmbrellaOutlined from '@mui/icons-material/UmbrellaOutlined'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'

import { formatTemp } from '../../format.js'

// Состояний погоды ровно четыре (HANDBOOK, раздел 8; API.md, Weather)
const CONDITION_ICON = {
  clear: <WbSunnyOutlined />,
  cloudy: <CloudOutlined />,
  rain: <UmbrellaOutlined />,
  snow: <AcUnitOutlined />,
}

function Stat({ value, label }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
  )
}

// Карточка погоды — верх макета 2.0. Текущей температуры в API нет:
// крупно показываем утренний минимум, под ним «ощущается как» и дневной максимум.
export default function WeatherCard({ weather }) {
  const rain = weather.precipitation_probability
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2.5, mb: 3 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
        {weather.city} · сегодня
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 56, lineHeight: 1 }}>
          {formatTemp(weather.temp_min)}
        </Typography>
        <Box sx={{ color: 'secondary.main', '& svg': { fontSize: 44 } }}>{CONDITION_ICON[weather.condition]}</Box>
      </Box>
      <Typography sx={{ color: 'text.secondary', fontSize: 15, mb: 2 }}>
        Ощущается как {formatTemp(weather.feels_like)}
      </Typography>
      <Box sx={{ display: 'flex', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
        <Stat value={rain == null ? '—' : `${rain}%`} label="осадки" />
        <Stat value={`${Math.round(weather.wind_speed)} м/с`} label="ветер" />
        <Stat value={`до ${formatTemp(weather.temp_max)}`} label="днём" />
      </Box>
    </Box>
  )
}
