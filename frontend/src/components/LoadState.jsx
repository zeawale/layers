import { Alert, Box, Button, CircularProgress } from '@mui/material'

// Пока данные грузятся — спиннер; не загрузились — ошибка и «Повторить»
export function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress size={28} />
    </Box>
  )
}

export function LoadError({ message, onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
      <Alert severity="error" sx={{ width: '100%' }}>{message}</Alert>
      <Button variant="outlined" onClick={onRetry}>Повторить</Button>
    </Box>
  )
}
