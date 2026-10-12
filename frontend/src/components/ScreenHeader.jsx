import { Box, Typography } from '@mui/material'

import BackButton from './BackButton.jsx'

// Шапка внутреннего экрана: «назад», заголовок по центру и место справа (например «1 / 2»).
// Справа пусто — оставляем место под ширину кнопки, чтобы заголовок стоял ровно по центру.
// muted — мелкая серая подпись вместо заголовка, когда крупный заголовок ниже (4.1 «Комплект дня»);
// close — крестик вместо стрелки (3.4)
export default function ScreenHeader({ title, onBack, backDisabled, right, muted = false, close = false }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
      <BackButton onClick={onBack} close={close} sx={backDisabled ? { visibility: 'hidden' } : undefined} />
      <Typography
        variant={muted ? 'body2' : 'h4'}
        component={muted ? 'p' : 'h1'}
        sx={{ flex: 1, textAlign: 'center', ...(muted && { color: 'text.secondary' }) }}
      >
        {title}
      </Typography>
      <Box sx={{ minWidth: 44, textAlign: 'right' }}>
        {right && <Typography variant="body2" sx={{ color: 'text.secondary' }}>{right}</Typography>}
      </Box>
    </Box>
  )
}
