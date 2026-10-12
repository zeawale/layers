import { useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Box, Button } from '@mui/material'

import { getToken } from '../api/client.js'
import { updateMe } from '../api/users.js'
import { LoadError, Loading } from '../components/LoadState.jsx'
import useAttributes from '../hooks/useAttributes.js'
import useCitySearch from '../hooks/useCitySearch.js'
import CityStep from './onboarding/CityStep.jsx'
import ColorsStep from './onboarding/ColorsStep.jsx'
import StepHeader from './onboarding/StepHeader.jsx'
import StyleStep, { sortStyles } from './onboarding/StyleStep.jsx'

// Онбординг: стиль → цвета → город. Стиль и цвета можно пропустить, город — нет (HANDBOOK, раздел 8).
// С главного экрана по 400 «нет города» приходят с state.step = 'city': только шаг города,
// без «назад», и стиль с цветами не отправляем — preferences заменяется целиком и стёр бы их
export default function Onboarding() {
  const navigate = useNavigate()
  const cityOnly = useLocation().state?.step === 'city'
  const [step, setStep] = useState(cityOnly ? 2 : 0)
  const [style, setStyle] = useState(null)
  const [palette, setPalette] = useState({ liked: [], disliked: [] })
  const city = useCitySearch()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { attrs, loading: attrsLoading, error: attrsError, retry: retryAttrs } = useAttributes()
  const colors = attrs?.color ?? []
  const styles = useMemo(() => sortStyles(attrs?.style ?? []), [attrs])

  async function finish() {
    setError('')
    setLoading(true)
    try {
      const body = { ...city.fields }
      if (!cityOnly) {
        body.preferences = {}
        if (style) body.preferences.style = style
        if (palette.liked.length) body.preferences.liked_colors = palette.liked
        if (palette.disliked.length) body.preferences.disliked_colors = palette.disliked
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

      {(error || city.error) && <Alert severity="error" sx={{ mb: 2 }}>{error || city.error}</Alert>}

      {step === 0 && attrsReady && <StyleStep styles={styles} value={style} onChange={setStyle} />}
      {step === 1 && attrsReady && (
        <ColorsStep colors={colors} liked={palette.liked} disliked={palette.disliked} onChange={setPalette} />
      )}
      {step === 2 && (
        <CityStep
          query={city.query}
          onQuery={city.changeQuery}
          cities={city.cities}
          selected={city.selected}
          onSelect={city.select}
          onGeolocate={city.geolocate}
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
        disabled={loading || (step === 2 && !city.fields)}
      >
        {loading ? 'Сохраняем…' : step === 2 ? 'Готово — подобрать комплект' : 'Далее'}
      </Button>
    </Box>
  )
}
