import { Box, Typography } from '@mui/material'

import IconCircle from './IconCircle.jsx'

// Экран-итог в авторизации (макеты 1.2.2, 1.2.4, 1.2.5): кружок с иконкой, заголовок 32, пояснение 14 и кнопки.
// tone — цвет кружка из темы: success (зелёный) или secondary (терракота, для ошибок).
// withBack — над экраном есть «назад» (1.2.2): кружок выше, чтобы стоять там же, где в макете
export default function AuthStatus({ icon, tone = 'success', title, text, withBack = false, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: withBack ? 7.75 : 17.5 }}>
      <IconCircle tone={tone} sx={{ mb: 2 }}>{icon}</IconCircle>
      <Typography variant="h2" sx={{ mb: 2.25 }}>{title}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>{text}</Typography>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>{children}</Box>
    </Box>
  )
}
