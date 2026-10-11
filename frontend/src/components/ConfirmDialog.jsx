import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

// Подтверждение опасного действия — макеты 3.3 и 3.11: заголовок, пояснение, «Удалить» и «Отмена»
export default function ConfirmDialog({ open, title, text, confirmLabel = 'Удалить', loading, error, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={() => !loading && onClose()} PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}>
      <DialogTitle sx={{ fontWeight: 700, fontSize: 18 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: 'text.secondary', fontSize: 15, lineHeight: 1.5 }}>{text}</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ flexDirection: 'column', gap: 1, px: 3, pb: 2 }}>
        <Button variant="contained" color="error" fullWidth onClick={onConfirm} disabled={loading}>
          {loading ? 'Удаляем…' : confirmLabel}
        </Button>
        <Button fullWidth onClick={onClose} disabled={loading} sx={{ color: 'text.primary', ml: '0 !important' }}>
          Отмена
        </Button>
      </DialogActions>
    </Dialog>
  )
}
