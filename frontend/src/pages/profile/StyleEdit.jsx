import { useMemo, useState } from 'react'
import { Box } from '@mui/material'

import { LoadError, Loading } from '../../components/LoadState.jsx'
import useAttributes from '../../hooks/useAttributes.js'
import StyleStep, { sortStyles } from '../onboarding/StyleStep.jsx'
import SaveButton from './SaveButton.jsx'
import useSave from './useSave.js'

// Макет 4.4 — шаг стиля из онбординга с «Сохранить». Повторное нажатие на стиль снимает выбор
export default function StyleEdit() {
  const { user, saving, error, run } = useSave()
  const { attrs, loading, error: attrsError, retry } = useAttributes()
  const styles = useMemo(() => sortStyles(attrs?.style ?? []), [attrs])
  const prefs = user.preferences
  const [style, setStyle] = useState(prefs.style)

  if (loading) return <Loading />
  if (attrsError) return <LoadError message={attrsError} onRetry={retry} />

  return (
    <Box>
      <StyleStep styles={styles} value={style} onChange={(value) => setStyle(value === style ? null : value)} />
      <SaveButton
        // preferences заменяется целиком: цвета отправляем как были
        onClick={() => run({ preferences: { ...prefs, style } })}
        saving={saving}
        disabled={style === prefs.style}
        error={error}
      />
    </Box>
  )
}
