import { Box, ButtonBase, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SearchIcon from '@mui/icons-material/Search'

import FormField from '../../components/FormField.jsx'

// Одноимённых городов бывает несколько (два Кировска) — различаем по координатам
const sameCity = (a, b) => a?.lat === b.lat && a?.lon === b.lon

// Строка «Определить автоматически» в каждом состоянии (макеты 1.6, 1.6.1–1.6.3)
const GEO = {
  idle: { text: 'Определить автоматически', color: 'weather.icon', circle: 'weather.sky', icon: 'weather.icon' },
  locating: { text: 'Определяем город…', color: 'text.secondary', circle: 'weather.sky', icon: 'weather.icon' },
  located: { text: 'Город определён автоматически', color: 'primary.main', circle: 'weather.sky', icon: 'weather.icon' },
  failed: { text: 'Не удалось определить город — введи вручную', color: 'error.main', circle: 'tint.secondary', icon: 'error.main' },
}

// «Где ты живёшь?» — шаг 3 онбординга (1.6) и экран 4.3 в профиле. Подсказки ищет useCitySearch, сюда приходит список.
// notFound — по запросу ничего (1.6.4); geo — состояние «Определить автоматически»
export default function CityStep({ query, onQuery, cities, selected, onSelect, onGeolocate, notFound = false, geo = 'idle' }) {
  const g = GEO[geo]
  return (
    <>
      <Typography variant="h2" sx={{ mb: 1.25 }}>Где ты живёшь?</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Город нужен для прогноза погоды: комплект подбирается под температуру, ветер и осадки.
      </Typography>

      <Box sx={{ mb: 2.5 }}>
        <FormField
          label="Город"
          icon={geo === 'located' ? <LocationOnOutlinedIcon /> : <SearchIcon />}
          placeholder="Начни вводить город"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          error={notFound ? 'Город не найден, проверь название' : undefined}
        />
      </Box>

      {cities.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 0.75, mb: 2.5, boxShadow: (t) => t.custom.cardShadow }}>
          {cities.map((city) => {
            const chosen = sameCity(selected, city)
            return (
              <ButtonBase
                key={`${city.name}-${city.lat}-${city.lon}`}
                onClick={() => onSelect(city)}
                aria-pressed={chosen}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, px: 1.75, py: 1.25, borderRadius: '14px', textAlign: 'left', bgcolor: chosen ? 'tint.success' : 'transparent' }}
              >
                <LocationOnOutlinedIcon sx={{ color: chosen ? 'primary.main' : 'text.secondary' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>{city.name}</Typography>
                  {(city.region || city.country) && (
                    <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
                      {[city.region, city.country].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                </Box>
                {chosen && <CheckIcon sx={{ color: 'primary.main' }} />}
              </ButtonBase>
            )
          })}
        </Box>
      )}

      <ButtonBase
        onClick={onGeolocate}
        disabled={geo === 'locating'}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.5, textAlign: 'left', borderRadius: 999 }}
      >
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', flexShrink: 0, bgcolor: g.circle, color: g.icon, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LocationOnOutlinedIcon fontSize="small" />
        </Box>
        <Typography variant="subtitle1" sx={{ color: g.color }}>{g.text}</Typography>
      </ButtonBase>
    </>
  )
}
