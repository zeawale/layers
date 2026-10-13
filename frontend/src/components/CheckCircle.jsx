import { Box } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// Кружок 24 px с галочкой: отмеченный — зелёный с белой галочкой, пустой — кольцо цвета ring с заливкой fill.
// Выбор вещи в гардеробе (3.10) и чек-лист этапов (1.7, 3.5)
export default function CheckCircle({ checked, ring = 'outline.main', fill = 'transparent', sx }) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid',
        borderColor: checked ? 'primary.main' : ring,
        bgcolor: checked ? 'primary.main' : fill,
        color: 'common.white',
        ...sx,
      }}
    >
      {checked && <CheckIcon sx={{ width: 16, height: 16 }} />}
    </Box>
  )
}
