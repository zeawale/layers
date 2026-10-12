import { Box, Typography } from '@mui/material'

import BackButton from './BackButton.jsx'

// Шапка внутреннего экрана: «назад», заголовок по центру и место справа (например «1 / 2»).
// Справа пусто — оставляем место под ширину кнопки, чтобы заголовок стоял ровно по центру.
// muted — мелкая серая подпись вместо заголовка, когда крупный заголовок ниже (4.1 «Комплект дня»)
export default function ScreenHeader({ title, onBack, backDisabled, right, muted = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
      <BackButton onClick={onBack} sx={backDisabled ? { visibility: 'hidden' } : undefined} />
      <Typography
        variant={muted ? 'body2' : 'h4'}
        component={muted ? 'p' : 'h1'}
        sx={{ flex: 1, textAlign: 'center', ...(muted && { color: 'text.secondary' }) }}
      >
        {title}
      </Typography>
      <Box sx={{ minWidth: 40, textAlign: 'right' }}>
        {right && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{right}</Typography>}
      </Box>
    </Box>
  )
}
