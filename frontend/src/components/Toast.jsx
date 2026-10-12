import { Snackbar } from '@mui/material'

// Уведомление сверху — тёмная плашка из темы (MuiSnackbarContent), как «Сессия истекла» в макете 2.12.
// text — что показать, null — ничего
export default function Toast({ text, onClose }) {
  return (
    <Snackbar
      open={Boolean(text)}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      message={text}
      // Название вещи до 100 символов без пробелов переносится, а не вылезает за экран
      slotProps={{ content: { sx: { overflowWrap: 'anywhere' } } }}
    />
  )
}
