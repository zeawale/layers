import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import ItemPhoto from './ItemPhoto.jsx'

// Карточка с квадратным фото, названием и описанием в несколько строк — стиль в онбординге (1.4).
// Вещи в гардеробе — pages/wardrobe/ItemTile.
// selected — выбранная: галочка на фото и тёмная рамка.
// imagePosition — какую часть фото оставить в квадрате (у вертикальных фото людей — чуть выше центра).
export default function PhotoCard({ image, imagePosition = 'center', title, subtitle, selected = false, onClick }) {
  return (
    <Box
      onClick={onClick}
      // Карточку можно выбрать и с клавиатуры: Tab, затем Enter или пробел (без прокрутки страницы)
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => {
          if (e.key !== 'Enter' && e.key !== ' ') return
          e.preventDefault()
          onClick()
        },
      })}
      sx={{
        minWidth: 0,
        borderRadius: '20px',
        border: '2px solid',
        borderColor: selected ? 'text.primary' : 'divider',
        bgcolor: 'background.paper',
        p: 1,
        cursor: onClick ? 'pointer' : 'default',
        height: 'fit-content',
      }}
    >
      <ItemPhoto src={image} position={imagePosition} sx={{ borderRadius: '12px', bgcolor: 'background.default', mb: 1 }}>
        {selected && (
          <Box
            sx={{
              position: 'absolute', top: 8, right: 8,
              width: 26, height: 26, borderRadius: '50%',
              bgcolor: 'text.primary', color: 'common.white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CheckIcon fontSize="inherit" />
          </Box>
        )}
      </ItemPhoto>
      <Box sx={{ px: 0.5, pb: 0.5 }}>
        <Typography variant="subtitle1" sx={{ mb: 0.25 }}>{title}</Typography>
        {subtitle && <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
    </Box>
  )
}
