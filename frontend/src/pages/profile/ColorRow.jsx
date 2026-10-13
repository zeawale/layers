import { Box, Typography } from '@mui/material'

import ColorDot from '../../components/ColorDot.jsx'

// «Люблю» / «Не ношу» и кружки цветов 28 px (4.2). label — подпись из справочника
export default function ColorRow({ title, values, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minHeight: 28 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', width: 62, flexShrink: 0 }}>{title}</Typography>
      {values.length ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
          {values.map((value) => <ColorDot key={value} value={value} label={label('color', value)} />)}
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: 'text.disabled' }}>не выбраны</Typography>
      )}
    </Box>
  )
}
