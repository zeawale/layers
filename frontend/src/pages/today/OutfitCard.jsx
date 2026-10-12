import { Box, Typography } from '@mui/material'
import { keyframes } from '@emotion/react'

import OutfitGrid from '../../components/OutfitGrid.jsx'
import Explanation from '../../components/Explanation.jsx'
import FeedbackBar from '../../components/FeedbackBar.jsx'
import Panel from '../../components/Panel.jsx'
import useSwipe from '../../hooks/useSwipe.js'
import OutfitChips from './OutfitChips.jsx'
import VariantButton from './VariantButton.jsx'
import VariantDots from './VariantDots.jsx'

const appear = keyframes`from { opacity: 0; } to { opacity: 1; }`

// Комплект дня (макеты 2.0, 2.1, 2.8): заголовок с «↻ N из M», плитки вещей, точки вариантов, чипы
// и «Почему этот комплект». Свайп по плиткам — соседний вариант.
// Чего не хватило — пустые слоты среди плиток (2.2). Не нашлось ничего — только объяснение движка, почему
export default function OutfitCard({ day, outfit, label, variants, feedback }) {
  const { items, missing } = outfit
  const canMore = day.variants.length < day.variants_max
  const swipe = useSwipe({ onLeft: () => variants.step(1), onRight: () => variants.step(-1) })
  // Комплект отмечен «надет» — варианты на сегодня не меняются, кнопка и точки неактивны
  const locked = variants.locked
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minHeight: 38, mb: 2.5 }}>
        <Typography variant="h3" component="h2">Комплект на сегодня</Typography>
        <VariantButton variant={outfit.variant} max={day.variants_max} canMore={canMore} busy={variants.busy} locked={locked} onClick={variants.another} />
      </Box>
      {(items.length > 0 || missing.length > 0) && (
        <Panel shadow sx={{ p: 1.5, pb: 2.5, mb: 2.5 }}>
          {/* Новый вариант проявляется, а не подменяется рывком; pan-y — вертикальная прокрутка работает как обычно */}
          <Box key={outfit.id} {...swipe} sx={{ touchAction: 'pan-y', animation: `${appear} 0.2s ease-out` }}>
            <OutfitGrid items={items} missing={missing} label={label} />
          </Box>
          <VariantDots
            variants={day.variants}
            selectedId={day.selected_id}
            canMore={canMore}
            disabled={variants.busy || locked}
            onSelect={variants.select}
          />
          {items.length > 0 && (
            <OutfitChips items={items} label={label} sx={{ mt: day.variants.length > 1 || !canMore ? 1.25 : 2.25 }} />
          )}
        </Panel>
      )}
      <Explanation text={outfit.explanation} />
      <FeedbackBar
        feedback={outfit.feedback}
        busy={feedback.busy}
        onRate={(rating) => feedback.rate(outfit, rating)}
        onWorn={() => feedback.toggleWorn(outfit)}
      />
    </>
  )
}
