import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

// Карточка с квадратным фото, названием и подписью — вещь в гардеробе, стиль в онбординге.
// selected — выбранная: галочка на фото и тёмная рамка. Нет фото или оно не загрузилось — иконка вешалки.
// imagePosition — какую часть фото оставить в квадрате (у вертикальных фото людей — чуть выше центра).
// wrap — подпись в несколько строк (описание стиля); у вещей название и подпись в одну строку с «…»
export default function PhotoCard({ image, imagePosition = 'center', title, subtitle, selected = false, onClick, wrap = false }) {
  const [failed, setFailed] = useState(false)
  const showImage = image && !failed
  return (
    <Box
      onClick={onClick}
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
      <Box
        sx={{
          position: 'relative',
          aspectRatio: '1 / 1',
          borderRadius: '12px',
          bgcolor: 'background.default',
          overflow: 'hidden',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        {showImage ? (
          <Box
            component="img"
            src={image}
            alt=""
            onError={() => setFailed(true)}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: imagePosition, display: 'block' }}
          />
        ) : (
          <CheckroomOutlined fontSize="large" />
        )}
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
      </Box>
      <Box sx={{ px: 0.5, pb: 0.5 }}>
        <Typography variant="subtitle1" noWrap={!wrap} sx={{ mb: 0.25 }}>{title}</Typography>
        {subtitle && <Typography variant="subtitle2" noWrap={!wrap} sx={{ color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
    </Box>
  )
}
