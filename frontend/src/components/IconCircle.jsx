import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Кружок 64 px с иконкой на светлом фоне цвета из темы: экраны-итоги, пустые состояния.
// tone — success (зелёный) или secondary (терракота, для ошибок)
export default function IconCircle({ children, tone = 'success', sx }) {
  return (
    <Box
      sx={(t) => ({
        width: 64,
        height: 64,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: alpha(t.palette[tone].main, 0.14),
        color: `${tone}.main`,
        ...sx,
      })}
    >
      {children}
    </Box>
  )
}
