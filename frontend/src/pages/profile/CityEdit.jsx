import { Box } from '@mui/material'

import useCitySearch from '../../hooks/useCitySearch.js'
import CityStep from '../onboarding/CityStep.jsx'
import SaveButton from './SaveButton.jsx'
import useSave from './useSave.js'

// Макет 4.3 — шаг города из онбординга с «Сохранить». В поле сразу текущий город
export default function CityEdit() {
  const { user, saving, error, run } = useSave()
  const city = useCitySearch(user.city ?? '')
  // Ничего не поменяли — сохранять нечего, иначе бэк заново искал бы город по названию
  const unchanged = !city.selected && city.query.trim() === (user.city ?? '')

  return (
    <Box>
      <CityStep
        query={city.query}
        onQuery={city.changeQuery}
        cities={city.cities}
        selected={city.selected}
        onSelect={city.select}
        onGeolocate={city.geolocate}
        notFound={city.notFound}
        geo={city.geo}
      />
      <SaveButton
        onClick={() => run(city.fields, city.fail)}
        saving={saving}
        disabled={!city.fields || unchanged}
        error={error || city.error}
      />
    </Box>
  )
}
