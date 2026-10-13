import { Box } from '@mui/material'

// Цвет иконки к каждой заливке — как в макетах
const ICON_COLOR = { success: 'primary.main', secondary: 'secondary.main', neutral: 'text.secondary' }

// Кружок с иконкой на сплошной светлой заливке (palette.tint).
// size — диаметр: 80 на экранах-итогах, в пустых состояниях и ошибках (макеты 1.2.x, 2.9–2.11, 3.1, 3.4),
// 36 в строках профиля (4.2), 40 в шторке фото (4.8). Иконка — меньше кружка пропорционально (36 px при 80).
// tone — success (зелёный), secondary (терракота, для ошибок) или neutral (бежевый)
export default function IconCircle({ children, tone = 'success', size = 80, sx }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        bgcolor: `tint.${tone}`,
        color: ICON_COLOR[tone],
        '& svg': { width: size * 0.45, height: size * 0.45 },
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
