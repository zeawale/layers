import { Typography } from '@mui/material'

// Подпись категории на плитке комплекта — белая «таблетка» в левом верхнем углу (макеты 2.0, 2.2, 2.13).
// В одну строку: в пустом слоте пунктирная рамка съедает пару пикселей, и «Верхняя одежда» переносилась
export default function CategoryPill({ children }) {
  return (
    <Typography
      variant="overline"
      sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'background.paper', color: 'text.secondary', borderRadius: 999, px: 1.25, py: 0.5, whiteSpace: 'nowrap' }}
    >
      {children}
    </Typography>
  )
}
