import { Box } from '@mui/material'

// Белая карточка со скруглением 24 px — блоки главного экрана (погода-ошибка, пустой гардероб, комплект).
// shadow — мягкая тень, как у карточки комплекта; radius — другое скругление в px (20 — цвета 1.5, список городов 1.6,
// «С чего начать» 3.1 и «Как получить хорошее фото» 3.4, характеристики вещи 3.2, карточки профиля 4.2).
// component — другой тег, например dl у характеристик вещи
export default function Panel({ children, shadow = false, radius = 24, component = 'div', sx }) {
  return (
    <Box
      component={component}
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
