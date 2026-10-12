import { Box, CircularProgress, Typography } from '@mui/material'

import ItemPhoto from '../../components/ItemPhoto.jsx'

// Миниатюра фото и кнопки рядом — «Переснять фото» при добавлении (3.6), «Заменить» и «Удалить фото» в правке (3.9).
// uploading — спиннер поверх миниатюры; error — 413/415 при загрузке, под строкой
export default function PhotoRow({ src, uploading, error, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ItemPhoto src={src} sx={{ width: 88, borderRadius: '16px', bgcolor: 'background.paper' }}>
          {uploading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </ItemPhoto>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>{children}</Box>
      </Box>
      {error && <Typography variant="body2" role="alert" sx={{ color: 'error.main', mt: 1 }}>{error}</Typography>}
    </Box>
  )
}
