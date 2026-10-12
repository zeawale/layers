import { Box, Button, Typography } from '@mui/material'
import InfoOutlined from '@mui/icons-material/InfoOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'

import IconCircle from './IconCircle.jsx'

// Макет 2.11 «Нет соединения»: бэк не ответил совсем (нет сети или сервер лежит).
// Во весь экран поверх нижней панели — без сети остальные вкладки тоже не откроются
export default function NoConnection({ onRetry }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 20,
        bgcolor: 'background.default',
        display: 'flex',
        justifyContent: 'center',
        pt: 27.5,
        px: 3,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 342, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <IconCircle tone="neutral" sx={{ mb: 2.5 }}><InfoOutlined /></IconCircle>
        <Typography variant="h2" sx={{ mb: 1.5 }}>Нет соединения</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>Проверьте интернет и попробуйте ещё раз.</Typography>
        <Button variant="contained" size="large" fullWidth startIcon={<RefreshIcon />} onClick={onRetry}>
          Повторить
        </Button>
      </Box>
    </Box>
  )
}
