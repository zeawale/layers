import { Box, Snackbar, Typography } from '@mui/material'

// Уведомление сверху — тёмная плашка из темы (MuiSnackbarContent), одна на всё приложение (HANDBOOK, раздел 8).
// text — что показать, null — ничего. hint — вторая строка, icon — значок в цветном кружке слева
// (как «Спасибо за оценку!» на макете 2.3)
export default function Toast({ text, hint, icon, onClose }) {
  const message = icon || hint ? (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {icon && (
        <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'secondary.main', color: 'common.white', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', '& svg': { width: 18, height: 18 } }}>
          {icon}
        </Box>
      )}
      <Box>
        <Typography variant="subtitle1">{text}</Typography>
        {hint && <Typography variant="body2">{hint}</Typography>}
      </Box>
    </Box>
  ) : text
  return (
    <Snackbar
      open={Boolean(text)}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      message={message}
      // Название вещи до 100 символов без пробелов переносится, а не вылезает за экран
      slotProps={{ content: { sx: { overflowWrap: 'anywhere' } } }}
    />
  )
}
