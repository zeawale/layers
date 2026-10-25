import { Box, Link, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'

import CategoryPill from './CategoryPill.jsx'
import PartnerCard from './PartnerCard.jsx'

// Пустой слот «Нет в гардеробе» на месте категории из missing (макет 2.2): пунктирная терракотовая рамка,
// подпись категории и ссылка на добавление вещи. Есть товары партнёров — вместо этого карточка товара
export default function MissingSlot({ label, suggestions = [], sx }) {
  if (suggestions.length > 0) return <PartnerCard label={label} suggestions={suggestions} sx={sx} />
  return (
    <Box
      sx={(t) => ({
        position: 'relative',
        minWidth: 0,
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: '16px',
        border: `1.5px dashed ${alpha(t.palette.secondary.main, 0.6)}`,
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        p: 1.25,
        ...sx,
      })}
    >
      <CategoryPill>{label}</CategoryPill>
      <Typography variant="overline" component="p" sx={{ color: 'secondary.main' }}>Нет в гардеробе</Typography>
      <Link component={RouterLink} to="/wardrobe/new" variant="body2" sx={{ color: 'text.primary' }}>
        Добавить вещь
      </Link>
    </Box>
  )
}
