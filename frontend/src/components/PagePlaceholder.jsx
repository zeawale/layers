import { Box, Typography } from '@mui/material'

// Временная заглушка для экранов, которые ещё не нарисованы в коде.
// Каждый экран заменяем настоящим по плану (вход и онбординг — к 12 октября, гардероб — к 26 октября).
export default function PagePlaceholder({ title }) {
  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', px: 3, py: 4 }}>
      <Typography variant="h2" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary">Экран ещё в разработке.</Typography>
    </Box>
  )
}
