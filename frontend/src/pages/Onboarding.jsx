import { useCallback, useMemo, useRef, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button } from '@mui/material'

import { getToken } from '../api/client.js'
import { searchCities } from '../api/geo.js'
import { updateMe } from '../api/users.js'
import LoadError from '../components/LoadError.jsx'
import Loading from '../components/Loading.jsx'
import useAttributes from '../hooks/useAttributes.js'
import CityStep from './onboarding/CityStep.jsx'
import ColorsStep from './onboarding/ColorsStep.jsx'
import StepHeader from './onboarding/StepHeader.jsx'
import StyleStep, { STYLE_DESC } from './onboarding/StyleStep.jsx'

// Порядок стилей — как в макете: стиль, которого нет в словаре описаний, идёт в конец
const STYLE_ORDER = Object.keys(STYLE_DESC)
function styleRank(value) {
  const i = STYLE_ORDER.indexOf(value)
  return i === -1 ? STYLE_ORDER.length : i
}

// Онбординг: стиль → цвета → город. Стиль и цвета можно пропустить, город — нет (HANDBOOK, раздел 8).
// С главного экрана по 400 «нет города» приходят с state.step = 'city': только шаг города,
// без «назад», и стиль с цветами не отправляем — preferences заменяется целиком и стёр бы их
export default function Onboarding() {
  const navigate = useNavigate()
  const cityOnly = useLocation().state?.step === 'city'
  const [step, setStep] = useState(cityOnly ? 2 : 0)
  const [style, setStyle] = useState(null)
  const [palette, setPalette] = useState({ liked: [], disliked: [] })
  const [cityQuery, setCityQuery] = useState('')
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { attrs, loading: attrsLoading, error: attrsError, retry: retryAttrs } = useAttributes()
  const colors = attrs?.color ?? []
  const styles = useMemo(() => [...(attrs?.style ?? [])].sort((a, b) => styleRank(a.value) - styleRank(b.value)), [attrs])
  const debounceRef = useRef(null)

  const findCities = useCallback((q) => {
    clearTimeout(debounceRef.current)
    if (q.length < 3) { setCities([]); return }
    debounceRef.current = setTimeout(() => {
      searchCities(q)
        .then((data) => setCities(data.cities || []))
        .catch(() => setCities([]))
    }, 300)
  }, [])

  function handleCityInput(val) {
    setCityQuery(val)
    setSelectedCity(null)
    findCities(val)
  }

  function selectCity(city) {
    setSelectedCity(city)
    setCityQuery(city.name)
    setCities([])
  }

  function handleGeolocate() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCity({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setCityQuery('Определяем…')
      },
      () => setError('Не удалось определить местоположение'),
    )
  }

  async function finish() {
    setError('')
    setLoading(true)
    try {
      const body = {}
      if (!cityOnly) {
        body.preferences = {}
        if (style) body.preferences.style = style
        if (palette.liked.length) body.preferences.liked_colors = palette.liked
        if (palette.disliked.length) body.preferences.disliked_colors = palette.disliked
      }
      if (selectedCity?.lat != null && selectedCity?.lon != null) {
        body.lat = selectedCity.lat
        body.lon = selectedCity.lon
        if (selectedCity.name) body.city = selectedCity.name
      } else if (cityQuery.trim()) {
        body.city = cityQuery.trim()
      }
      await updateMe(body)
      // Первый подбор показываем экраном 1.7 «Подбираем первый комплект», а не скелетоном
      navigate('/today', { replace: true, state: { first: !cityOnly } })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function next() {
    if (step < 2) setStep(step + 1)
    else finish()
  }

  // Онбординг без входа не открываем
  if (!getToken()) return <Navigate to="/login" replace />

  const attrsReady = !attrsLoading && !attrsError

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2, pb: 4 }}>
      <StepHeader step={step} total={3} onBack={cityOnly ? null : () => setStep(step - 1)} onSkip={step < 2 ? next : null} />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {step === 0 && attrsReady && <StyleStep styles={styles} value={style} onChange={setStyle} />}
      {step === 1 && attrsReady && (
        <ColorsStep colors={colors} liked={palette.liked} disliked={palette.disliked} onChange={setPalette} />
      )}
      {step === 2 && (
        <CityStep
          query={cityQuery}
          onQuery={handleCityInput}
          cities={cities}
          selected={selectedCity}
          onSelect={selectCity}
          onGeolocate={handleGeolocate}
        />
      )}

      {/* Стили и цвета приходят из справочника: пока он грузится — спиннер, не пришёл — ошибка и «Повторить» */}
      {step < 2 && attrsLoading && <Loading />}
      {step < 2 && attrsError && <LoadError message={attrsError} onRetry={retryAttrs} />}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={next}
        // Без города нет погоды, шаг города пропустить нельзя
        disabled={loading || (step === 2 && !selectedCity && !cityQuery.trim())}
      >
        {loading ? 'Сохраняем…' : step === 2 ? 'Готово — подобрать комплект' : 'Далее'}
      </Button>
    </Box>
  )
}
