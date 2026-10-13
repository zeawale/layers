import { Box, Typography } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

// Метка «авто» внутри поля, перед стрелкой: значение предзаполнило распознавание (3.6)
export default function AutoChip() {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, height: 24, px: 1, borderRadius: 999, bgcolor: 'tint.gold', color: 'gold.dark' }}>
      <AutoAwesomeOutlined sx={{ width: 14, height: 14 }} />
      <Typography variant="subtitle2">авто</Typography>
    </Box>
  )
}
