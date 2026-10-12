import { Alert, Box, Button } from '@mui/material'

// Запрос не удался: текст ошибки и «Повторить» — на всех экранах, которые что-то грузят
export default function LoadError({ message, onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 4 }}>
      <Alert severity="error" sx={{ width: '100%' }}>{message}</Alert>
      <Button variant="outlined" onClick={onRetry}>Повторить</Button>
    </Box>
  )
}
