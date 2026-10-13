import { Box, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import IconCircle from '../../components/IconCircle.jsx'

// Строка настроек профиля (4.2): кружок 36 с иконкой, название, значение серым и стрелка. Без разделителей
export default function SettingsRow({ icon, title, value, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{ all: 'unset', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 2, py: 1, cursor: 'pointer' }}
    >
      <IconCircle tone="neutral" size={36}>{icon}</IconCircle>
      <Typography variant="subtitle1" component="span" sx={{ flex: 1 }}>{title}</Typography>
      {value && <Typography component="span" noWrap sx={{ color: 'text.secondary', maxWidth: 140 }}>{value}</Typography>}
      <ChevronRightIcon sx={{ color: 'text.disabled' }} />
    </Box>
  )
}
