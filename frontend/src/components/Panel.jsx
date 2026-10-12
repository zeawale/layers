import { Box } from '@mui/material'

// Белая карточка со скруглением 24 px — блоки главного экрана (погода-ошибка, пустой гардероб, комплект).
// shadow — мягкая тень, как у карточки комплекта
export default function Panel({ children, shadow = false, sx }) {
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        borderRadius: '24px',
        p: 3,
        boxShadow: shadow ? (t) => t.custom.cardShadow : 'none',
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}
