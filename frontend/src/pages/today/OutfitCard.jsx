import { Box, Typography } from '@mui/material'

import OutfitGrid from '../../components/OutfitGrid.jsx'
import Panel from '../../components/Panel.jsx'
import Explanation from './Explanation.jsx'
import OutfitChips from './OutfitChips.jsx'

// Комплект дня (макет 2.0): заголовок, плитки вещей с чипами и «Почему этот комплект».
// Вещей может не найтись совсем — тогда только объяснение движка, почему
export default function OutfitCard({ outfit, label }) {
  const { items } = outfit
  return (
    <>
      {/* Высота строки — под кнопку вариантов справа (макет 2.0) */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 37, mb: 2.5 }}>
        <Typography variant="h3" component="h2">Комплект на сегодня</Typography>
      </Box>
      {items.length > 0 && (
        <Panel shadow sx={{ p: 1.5, pb: 2.5, mb: 2.5 }}>
          <OutfitGrid items={items} label={label} />
          <OutfitChips items={items} label={label} />
        </Panel>
      )}
      <Explanation text={outfit.explanation} />
    </>
  )
}
