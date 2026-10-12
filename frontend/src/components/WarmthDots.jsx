import { Box } from '@mui/material'

// Теплота кружками (макет 3.2): value закрашенных из max, остальные — пустые с тонкой рамкой.
// max — сколько уровней в справочнике (GET /attributes, warmth), а не число в коде
export default function WarmthDots({ value, max }) {
  return (
    <Box component="span" aria-hidden sx={{ display: 'inline-flex', gap: '2px', verticalAlign: 'middle' }}>
      {Array.from({ length: max }, (_, i) => (
        <Box
          key={i}
          component="span"
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            boxSizing: 'border-box',
            ...(i < value ? { bgcolor: 'text.primary' } : { border: '1px solid', borderColor: 'text.secondary' }),
          }}
        />
      ))}
    </Box>
  )
}
