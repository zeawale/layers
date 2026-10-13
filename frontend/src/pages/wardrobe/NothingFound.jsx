import { Box, Button, Typography } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import IconCircle from '../../components/IconCircle.jsx'

// Макет 3.8 «Гардероб · ничего не нашлось»
export default function NothingFound({ onClear }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 5 }}>
      <IconCircle tone="neutral" sx={{ mb: 2.5 }}><SearchIcon /></IconCircle>
      <Typography variant="h3" component="h2" sx={{ mb: 1.25 }}>Ничего не нашлось</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>Попробуй другое название.</Typography>
      <Button variant="outlined" size="large" onClick={onClear}>Очистить поиск</Button>
    </Box>
  )
}
