import AcUnitOutlined from '@mui/icons-material/AcUnitOutlined'
import FilterDramaOutlined from '@mui/icons-material/FilterDramaOutlined'
import UmbrellaOutlined from '@mui/icons-material/UmbrellaOutlined'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'

// Иконка погоды по condition — состояний ровно четыре (API.md, Weather). Главный экран и история
const ICON = { clear: WbSunnyOutlined, cloudy: FilterDramaOutlined, rain: UmbrellaOutlined, snow: AcUnitOutlined }

export default function WeatherIcon({ condition, sx }) {
  const Icon = ICON[condition] ?? FilterDramaOutlined
  return <Icon sx={{ color: 'weather.icon', ...sx }} />
}
