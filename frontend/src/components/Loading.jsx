import { Box, CircularProgress } from '@mui/material'

// Спиннер по центру, пока грузятся данные экрана
export default function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  )
}
