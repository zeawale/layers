import { Box, ButtonBase } from '@mui/material'

// Ряд точек-кнопок: текущая тёмная, нажатие выбирает. Варианты комплекта (2.0) и товары партнёра в слоте.
// size — 'medium' под плитками комплекта, 'small' внутри карточки товара
const SIZES = { medium: { hit: 24, dot: 8 }, small: { hit: 16, dot: 6 } }

export default function DotButtons({ ids, currentId, onSelect, itemLabel, groupLabel, disabled, size = 'medium', sx }) {
  const { hit, dot } = SIZES[size]
  return (
    <Box role="group" aria-label={groupLabel} sx={{ display: 'flex', ...sx }}>
      {ids.map((id, i) => {
        const current = id === currentId
        return (
          <ButtonBase
            key={id}
            onClick={() => onSelect(id)}
            disabled={disabled}
            aria-label={itemLabel(i)}
            aria-current={current ? 'true' : undefined}
            sx={{ width: hit, height: hit, borderRadius: '50%' }}
          >
            <Box sx={{ width: dot, height: dot, borderRadius: '50%', bgcolor: current ? 'text.primary' : 'outline.main' }} />
          </ButtonBase>
        )
      })}
    </Box>
  )
}
