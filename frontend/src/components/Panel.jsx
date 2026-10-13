import { Box } from '@mui/material'

// Белая карточка со скруглением 24 px — блоки главного экрана (погода-ошибка, пустой гардероб, комплект).
// shadow — мягкая тень, как у карточки комплекта; radius — другое скругление в px (20 — цвета 1.5, список городов 1.6,
// «С чего начать» 3.1, карточки профиля 4.2)
export default function Panel({ children, shadow = false, radius = 24, sx }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: `${radius}px`,
        p: 3,
        boxShadow: shadow ? (t) => t.custom.cardShadow : 'none',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
