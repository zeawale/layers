import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import ItemPhoto from '../../components/ItemPhoto.jsx'

// Вещь в сетке гардероба (макеты 3.0, 3.10): фото 165×196 со скруглением 20 прямо на фоне, под ним название
// и «Категория · цвет». selecting — режим выбора: кружок в углу фото; selected — тёмная рамка и галочка
export default function ItemTile({ image, title, subtitle, selecting, selected, onClick }) {
  return (
    <Box
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-pressed={selecting ? selected : undefined}
      // Как у кнопки: Enter и пробел; пробел без прокрутки страницы
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return
        e.preventDefault()
        onClick()
      }}
      sx={{ minWidth: 0, cursor: 'pointer' }}
    >
      <ItemPhoto
        src={image}
        sx={{
          aspectRatio: '165 / 196',
          borderRadius: '20px',
          bgcolor: 'background.paper',
          mb: 0.5,
          // Рамка выбранной вещи поверх фото, а не вокруг — сетка не сдвигается
          ...(selected && {
            '&::after': { content: '""', position: 'absolute', inset: 0, borderRadius: '20px', border: '3px solid', borderColor: 'primary.main' },
          }),
        }}
      >
        {selecting && (
          <Box
            sx={{
              position: 'absolute', top: 10, right: 10, zIndex: 1,
              width: 24, height: 24, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...(selected
                ? { bgcolor: 'primary.main', color: 'common.white' }
                : { bgcolor: 'background.paper', border: '1.5px solid', borderColor: 'outline.main' }),
            }}
          >
            {selected && <CheckIcon sx={{ width: 16, height: 16 }} />}
          </Box>
        )}
      </ItemPhoto>
      <Typography variant="subtitle1" noWrap>{title}</Typography>
      <Typography variant="subtitle2" noWrap sx={{ color: 'text.disabled' }}>{subtitle}</Typography>
    </Box>
  )
}
