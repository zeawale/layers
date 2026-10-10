import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

// Экран-итог в авторизации: кружок с иконкой, заголовок, пояснение и кнопки.
// tone — цвет кружка из темы: success (зелёный) или secondary (терракота, для ошибок).
export default function AuthStatus({ icon, tone = 'success', title, text, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 10 }}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (t) => alpha(t.palette[tone].main, 0.14),
          color: `${tone}.main`,
          '& svg': { fontSize: 26 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h2" sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: 15, lineHeight: 1.5 }}>
        {text}
      </Typography>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 1.5 }}>{children}</Box>
    </Box>
  )
}
