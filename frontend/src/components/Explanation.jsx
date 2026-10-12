import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

// «Почему этот комплект» (макет 2.0) и «Почему был этот комплект» (4.1) — тёмная карточка, текст движка как есть
export default function Explanation({ text, title = 'Почему этот комплект' }) {
  return (
    <Box sx={{ bgcolor: 'text.primary', color: 'common.white', borderRadius: '24px', p: 3, mb: 2.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
        <Box
          sx={(t) => ({
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: alpha(t.palette.common.white, 0.08), color: 'gold.main',
          })}
        >
          <AutoAwesomeOutlined sx={{ width: 18, height: 18 }} />
        </Box>
        <Typography variant="h4" component="h2">{title}</Typography>
      </Box>
      <Typography sx={(t) => ({ color: alpha(t.palette.common.white, 0.88) })}>{text}</Typography>
    </Box>
  )
}
