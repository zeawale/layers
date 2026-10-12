import { Box, Typography } from '@mui/material'

import IconCircle from './IconCircle.jsx'

// Экран-итог в авторизации: кружок с иконкой, заголовок, пояснение и кнопки.
// tone — цвет кружка из темы: success (зелёный) или secondary (терракота, для ошибок).
export default function AuthStatus({ icon, tone = 'success', title, text, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 10 }}>
      <IconCircle tone={tone} sx={{ mb: 3 }}>{icon}</IconCircle>
      <Typography variant="h2" sx={{ mb: 1.5 }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>{text}</Typography>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>{children}</Box>
    </Box>
  )
}
