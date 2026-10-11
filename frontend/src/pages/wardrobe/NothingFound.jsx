import { Box, Button, Typography } from '@mui/material'

// Макет 3.8 «Гардероб · ничего не нашлось»
export default function NothingFound({ onClear }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h2" sx={{ mb: 1 }}>Ничего не нашлось</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15 }}>Попробуйте другое название.</Typography>
      <Button variant="outlined" onClick={onClear}>Очистить поиск</Button>
    </Box>
  )
}
