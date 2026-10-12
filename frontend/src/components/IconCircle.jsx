import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Кружок с иконкой. size — диаметр: 64 на экранах-итогах и в пустых состояниях, 40 в строках списков.
// tone — success (зелёный) или secondary (терракота, для ошибок) на светлом фоне своего цвета;
// neutral — бежевый фон страницы и серая иконка, как в строках профиля
export default function IconCircle({ children, tone = 'success', size = 64, sx }) {
  return (
    <Box
      sx={(t) => ({
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        ...(tone === 'neutral'
          ? { bgcolor: 'background.default', color: 'text.secondary' }
          : { bgcolor: alpha(t.palette[tone].main, 0.14), color: `${tone}.main` }),
        ...sx,
      })}
    >
      {children}
    </Box>
  )
}
