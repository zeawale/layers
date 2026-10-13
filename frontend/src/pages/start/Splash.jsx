import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Заставка (макеты 1.0, 1.0a, 1.0r): зелёный экран, кружок с «L», «layers», подпись курсивом и полоска загрузки.
// line — подпись под логотипом; progress — заполнение полоски, 0–100 (едет плавно)
export default function Splash({ line, progress }) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'primary.main', color: 'common.white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3, textAlign: 'center' }}>
      <Box sx={{ width: 76, height: 76, borderRadius: '50%', border: '1.5px solid', borderColor: 'common.white', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
        <Typography variant="h2" component="span">L</Typography>
      </Box>
      <Typography variant="logo" component="h1" sx={{ mb: 1.5 }}>layers</Typography>
      <Typography variant="tagline" component="p" sx={(t) => ({ color: alpha(t.palette.common.white, 0.72), minHeight: '1.3em' })}>{line}</Typography>
      <Box
        role="progressbar"
        aria-valuenow={progress}
        aria-label="Загрузка"
        sx={(t) => ({ position: 'absolute', bottom: 82, left: '50%', ml: '-60px', width: 120, height: 3, borderRadius: 999, bgcolor: alpha(t.palette.common.white, 0.2), overflow: 'hidden' })}
      >
        <Box sx={{ width: `${progress}%`, height: '100%', bgcolor: 'common.white', transition: 'width 0.8s ease-out' }} />
      </Box>
    </Box>
  )
}
