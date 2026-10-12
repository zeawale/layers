import { Box, Button, Typography } from '@mui/material'

// Белая карточка профиля (макет 4.2): скругление 20, отступ 18
export default function ProfileCard({ children, sx }) {
  return <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2.25, ...sx }}>{children}</Box>
}

// Заголовок карточки и зелёная «Изменить» справа
export function CardHeader({ title, onEdit }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h4" component="h2">{title}</Typography>
      <Button variant="text" size="small" onClick={onEdit} sx={{ minHeight: 0, px: 1, mr: -1, color: 'primary.main' }}>
        Изменить
      </Button>
    </Box>
  )
}
