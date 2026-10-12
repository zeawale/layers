import { Box } from '@mui/material'

// Цвет иконки к каждой заливке — как в макетах
const ICON_COLOR = { success: 'primary.main', secondary: 'secondary.main', neutral: 'text.secondary' }

// Кружок 80 px с иконкой 36 px: экраны-итоги, пустые состояния и ошибки (по макетам 1.2.x, 2.9–2.11, 3.1, 3.4).
// tone — success (зелёный), secondary (терракота, для ошибок) или neutral (бежевый, «нет сети»)
export default function IconCircle({ children, tone = 'success', sx }) {
  return (
    <Box
      sx={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: `tint.${tone}`,
        color: ICON_COLOR[tone],
        '& svg': { width: 36, height: 36 },
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
