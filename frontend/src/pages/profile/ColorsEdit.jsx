import { useState } from 'react'
import { Box } from '@mui/material'

import { LoadError, Loading } from '../../components/LoadState.jsx'
import useAttributes from '../../hooks/useAttributes.js'
import ColorsStep from '../onboarding/ColorsStep.jsx'
import SaveButton from './SaveButton.jsx'
import useSave from './useSave.js'

const sameSet = (a, b) => a.length === b.length && a.every((x) => b.includes(x))

// Макет 4.5 — шаг цветов из онбординга с «Сохранить»
export default function ColorsEdit() {
  const { user, saving, error, run } = useSave()
  const { attrs, loading, error: attrsError, retry } = useAttributes()
  const prefs = user.preferences
  const [palette, setPalette] = useState({ liked: prefs.liked_colors, disliked: prefs.disliked_colors })
  const unchanged = sameSet(palette.liked, prefs.liked_colors) && sameSet(palette.disliked, prefs.disliked_colors)

  if (loading) return <Loading />
  if (attrsError) return <LoadError message={attrsError} onRetry={retry} />

  return (
    <Box>
      <ColorsStep colors={attrs.color} liked={palette.liked} disliked={palette.disliked} onChange={setPalette} />
      <SaveButton
        // preferences заменяется целиком: стиль отправляем как был
        onClick={() => run({ preferences: { ...prefs, liked_colors: palette.liked, disliked_colors: palette.disliked } })}
        saving={saving}
        disabled={unchanged}
        error={error}
      />
    </Box>
  )
}
