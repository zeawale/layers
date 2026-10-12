import { useId } from 'react'
import { Alert, Box, Button, Dialog, Typography } from '@mui/material'

// Подтверждение удаления — макеты 3.3 и 3.11: заголовок, пояснение, «Удалить» и «Отмена».
// Пока идёт запрос, окно не закрывается и кнопки неактивны; ошибка — внутри окна
export default function ConfirmDialog({ open, title, text, confirmLabel = 'Удалить', loading, error, onConfirm, onClose }) {
  const titleId = useId()
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      aria-labelledby={titleId}
      slotProps={{ paper: { sx: { borderRadius: '20px', p: 3, m: 2 } } }}
    >
      <Typography id={titleId} variant="h3" component="h2" sx={{ mb: 1, overflowWrap: 'anywhere' }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary' }}>{text}</Typography>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
        <Button variant="contained" color="error" fullWidth onClick={onConfirm} disabled={loading}>
          {loading ? 'Удаляем…' : confirmLabel}
        </Button>
        <Button variant="outlined" fullWidth onClick={onClose} disabled={loading}>Отмена</Button>
      </Box>
    </Dialog>
  )
}
