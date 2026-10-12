import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import SearchIcon from '@mui/icons-material/Search'

import FormField from '../../components/FormField.jsx'

// Одноимённых городов бывает несколько (два Кировска) — различаем по координатам
const sameCity = (a, b) => a?.lat === b.lat && a?.lon === b.lon

// «Где ты живёшь?» — шаг 3 онбординга и экран 4.3 в профиле. Подсказки ищет useCitySearch, сюда приходит список
export default function CityStep({ query, onQuery, cities, selected, onSelect, onGeolocate }) {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 1 }}>Где ты живёшь?</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Город нужен для прогноза погоды: комплект подбирается под температуру, ветер и осадки.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <FormField
          label="Город"
          icon={<SearchIcon />}
          placeholder="Москва"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
        />
      </Box>

      {cities.length > 0 && (
        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, overflow: 'hidden', mb: 2 }}>
          {cities.map((city, i) => {
            const chosen = sameCity(selected, city)
            return (
              <Box
                key={`${city.name}-${city.lat}-${city.lon}`}
                onClick={() => onSelect(city)}
                sx={(t) => ({
                  display: 'flex', alignItems: 'center', gap: 1.5,
                  px: 2, py: 1.5, cursor: 'pointer',
                  bgcolor: chosen ? alpha(t.palette.primary.main, 0.1) : 'transparent',
                  '&:hover': { bgcolor: chosen ? alpha(t.palette.primary.main, 0.1) : 'action.hover' },
                  borderBottom: i < cities.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                })}
              >
                <LocationOnOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1">{city.name}</Typography>
                  {(city.region || city.country) && (
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {[city.region, city.country].filter(Boolean).join(', ')}
                    </Typography>
                  )}
                </Box>
                {chosen && <CheckIcon fontSize="small" sx={{ color: 'primary.main' }} />}
              </Box>
            )
          })}
        </Box>
      )}

      <Box onClick={onGeolocate} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4, cursor: 'pointer' }}>
        <Box
          sx={{
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: 'background.paper', color: 'text.secondary',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <LocationOnOutlinedIcon fontSize="small" />
        </Box>
        <Typography sx={{ color: 'text.secondary' }}>Определить автоматически</Typography>
      </Box>
    </>
  )
}
