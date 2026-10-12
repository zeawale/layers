import { Box, Button, Typography } from '@mui/material'
import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined'

import IconCircle from '../../components/IconCircle.jsx'

// 404 и 403 у вещи: удалили в другой вкладке, старая ссылка или чужая вещь — различать не нужно
export default function ItemMissing({ onBack }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 6 }}>
      <IconCircle tone="secondary" sx={{ mb: 3 }}><SearchOffOutlined /></IconCircle>
      <Typography variant="h2" sx={{ mb: 1.5 }}>Вещь не найдена</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>Возможно, её уже удалили из гардероба.</Typography>
      <Button variant="contained" size="large" fullWidth onClick={onBack}>В гардероб</Button>
    </Box>
  )
}
