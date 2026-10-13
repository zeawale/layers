import { Box } from '@mui/material'

import ColorDot from './ColorDot.jsx'

// Цвет справочника — кружок и подпись рядом: список и поле «Цвет» в форме вещи (3.6, 3.9), карточка вещи (3.2).
// Длинная подпись обрезается многоточием, кружок не сжимается
export default function ColorLabel({ value, label, size = 20 }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, maxWidth: '100%', verticalAlign: 'top' }}>
      <ColorDot value={value} size={size} />
      <Box component="span" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Box>
    </Box>
  )
}
