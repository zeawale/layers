import { Box, Button, CircularProgress, Typography } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'

import ItemPhoto from '../../components/ItemPhoto.jsx'

// Маленькая белая «таблетка» с иконкой — «Заменить фото», «Удалить фото»
const small = { minHeight: 32, px: 1.5, bgcolor: 'background.paper', borderColor: 'background.paper', '&:hover': { bgcolor: 'background.paper', borderColor: 'outline.main' } }

// «Фото вещи» в правке (макет 3.9): бежевая карточка, миниатюра и кнопки. Без фото — «Добавить фото».
// uploading — спиннер поверх миниатюры; error — 413/415 при загрузке, под кнопками
export default function PhotoEditCard({ src, hasPhoto, uploading, disabled, error, onPick, onRemove }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.75, p: 1.5, mb: 3, borderRadius: '20px', bgcolor: 'tint.neutral' }}>
      <ItemPhoto src={src} sx={{ width: 84, aspectRatio: '84 / 100', borderRadius: '14px', bgcolor: 'background.paper' }}>
        {uploading && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </ItemPhoto>
      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.75, pt: 0.5 }}>
        <Typography variant="subtitle1">Фото вещи</Typography>
        <Button variant="outlined" startIcon={<PhotoCameraOutlined />} onClick={onPick} disabled={disabled} sx={small}>
          {hasPhoto ? 'Заменить фото' : 'Добавить фото'}
        </Button>
        {hasPhoto && (
          <Button variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={onRemove} disabled={disabled} sx={{ ...small, color: 'error.main' }}>
            Удалить фото
          </Button>
        )}
        {error && <Typography variant="body2" role="alert" sx={{ color: 'error.main' }}>{error}</Typography>}
      </Box>
    </Box>
  )
}
