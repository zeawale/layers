import { Alert, Box, Button } from '@mui/material'

// Кнопка «Сохранить» внизу экранов правки профиля и ошибка над ней
export default function SaveButton({ onClick, saving, disabled, error }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" size="large" fullWidth onClick={onClick} disabled={saving || disabled}>
        {saving ? 'Сохраняем…' : 'Сохранить'}
      </Button>
    </Box>
  )
}
