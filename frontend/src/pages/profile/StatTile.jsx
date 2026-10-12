import { Box, Typography } from '@mui/material'

// Счётчик под шапкой профиля (4.2): число и подпись, плитка 107×73
export default function StatTile({ value, label }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, bgcolor: 'background.paper', borderRadius: '20px', px: 1.75, py: 1.75 }}>
      <Typography variant="h3" sx={{ mb: 0.5 }}>{value}</Typography>
      <Typography variant="caption" component="p" noWrap sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
  )
}
