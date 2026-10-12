import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AcUnitOutlined from '@mui/icons-material/AcUnitOutlined'
import AirOutlined from '@mui/icons-material/AirOutlined'
import DeviceThermostatOutlined from '@mui/icons-material/DeviceThermostatOutlined'
import FilterDramaOutlined from '@mui/icons-material/FilterDramaOutlined'
import PlaceOutlined from '@mui/icons-material/PlaceOutlined'
import UmbrellaOutlined from '@mui/icons-material/UmbrellaOutlined'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'

import { formatTemp } from '../../format.js'

// Состояний погоды ровно четыре (API.md, Weather)
const CONDITION_ICON = {
  clear: WbSunnyOutlined,
  cloudy: FilterDramaOutlined,
  rain: UmbrellaOutlined,
  snow: AcUnitOutlined,
}

function Stat({ icon: Icon, value, label }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Icon sx={{ display: 'block', color: 'weather.icon', width: 20, height: 20, mb: 1 }} />
      <Typography variant="subtitle1" sx={{ mb: 0.375 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
  )
}

// Карточка погоды — верх макета 2.0. Текущей температуры в API нет (Weather: минимум и максимум за день),
// поэтому крупно — минимум дня с подписью «сегодня», ниже «ощущается как» и дневной максимум
export default function WeatherCard({ weather }) {
  const Icon = CONDITION_ICON[weather.condition] ?? FilterDramaOutlined
  const rain = weather.precipitation_probability
  return (
    <Box
      sx={(t) => {
        const { sky, sun } = t.palette.weather
        return {
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '24px',
          px: 2.75,
          pt: 2.375,
          pb: 2.375,
          mb: 2.5,
          // Тёплое пятно «солнца» в правом верхнем углу на голубом фоне
          background: `radial-gradient(circle at 89% 22%, ${sun} 0, ${sun} 50px, ${alpha(sun, 0)} 130px), ${sky}`,
        }
      }}
    >
      <Icon sx={{ position: 'absolute', top: 44, right: 26, width: 76, height: 76, color: 'weather.icon' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
        <PlaceOutlined sx={{ width: 16, height: 16 }} />
        <Typography variant="body2" noWrap>{weather.city} · сегодня</Typography>
      </Box>
      <Typography variant="temperature" component="p" sx={{ mb: 0.25 }}>{formatTemp(weather.temp_min)}</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 2 }}>Ощущается как {formatTemp(weather.feels_like)}</Typography>
      <Box sx={(t) => ({ display: 'flex', borderTop: `1px solid ${alpha(t.palette.text.primary, 0.08)}`, pt: 2 })}>
        {/* Вероятности может не быть, если Open-Meteo её не отдал */}
        <Stat icon={UmbrellaOutlined} value={rain == null ? '—' : `${rain}%`} label="осадки" />
        <Stat icon={AirOutlined} value={`${Math.round(weather.wind_speed)} м/с`} label="ветер" />
        <Stat icon={DeviceThermostatOutlined} value={`до ${formatTemp(weather.temp_max)}`} label="днём" />
      </Box>
    </Box>
  )
}
