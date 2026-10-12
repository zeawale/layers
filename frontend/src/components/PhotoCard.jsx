import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

import ItemPhoto from './ItemPhoto.jsx'

// Карточка с квадратным фото, названием и подписью — вещь в гардеробе, стиль в онбординге.
// selected — выбранная: галочка на фото и тёмная рамка.
// imagePosition — какую часть фото оставить в квадрате (у вертикальных фото людей — чуть выше центра).
// wrap — подпись в несколько строк (описание стиля); у вещей название и подпись в одну строку с «…»
export default function PhotoCard({ image, imagePosition = 'center', title, subtitle, selected = false, onClick, wrap = false }) {
  return (
    <Box
      onClick={onClick}
      // Карточку можно открыть и с клавиатуры: Tab и Enter
      {...(onClick && {
        role: 'button',
        tabIndex: 0,
        onKeyDown: (e) => e.key === 'Enter' && onClick(),
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
        <Typography variant="subtitle1" noWrap={!wrap} sx={{ mb: 0.25 }}>{title}</Typography>
        {subtitle && <Typography variant="subtitle2" noWrap={!wrap} sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
    </Box>
  )
}
