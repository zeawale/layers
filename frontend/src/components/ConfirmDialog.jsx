import { useId } from 'react'
import { Alert, Box, Button, Dialog, Typography } from '@mui/material'

import ItemPhoto from './ItemPhoto.jsx'

// Подтверждение удаления — макеты 3.3 и 3.11: шторка снизу с отступом 16, всё по центру — фото вещи (если одна),
// заголовок, пояснение, «Удалить» и «Отмена». image — адрес фото: undefined — без фото (несколько вещей),
// null — вещь без фото, тогда вешалка. Пока идёт запрос, окно не закрывается и кнопки неактивны; ошибка — внутри окна
export default function ConfirmDialog({ open, title, text, image, confirmLabel = 'Удалить', loading, error, onConfirm, onClose }) {
  const titleId = useId()
  return (
    <Dialog
      open={open}
      onClose={() => !loading && onClose()}
      aria-labelledby={titleId}
      sx={{ '& .MuiDialog-container': { alignItems: 'flex-end' } }}
      slotProps={{ paper: { sx: { width: '100%', maxWidth: 358, m: 2, p: 3, borderRadius: '28px', textAlign: 'center' } } }}
    >
      {image !== undefined && (
        <ItemPhoto src={image} sx={{ width: 88, mx: 'auto', mb: 2, borderRadius: '16px', bgcolor: 'background.default' }} />
      )}
      <Typography id={titleId} variant="h3" component="h2" sx={{ mb: 1, overflowWrap: 'anywhere' }}>{title}</Typography>
      <Typography sx={{ color: 'text.secondary' }}>{text}</Typography>
      {error && <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>{error}</Alert>}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 3 }}>
        <Button variant="contained" color="error" size="large" fullWidth onClick={onConfirm} disabled={loading}>
          {loading ? 'Удаляем…' : confirmLabel}
        </Button>
        <Button variant="outlined" size="large" fullWidth onClick={onClose} disabled={loading}>Отмена</Button>
      </Box>
    </Dialog>
  )
}
