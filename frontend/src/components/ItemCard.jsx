import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { mediaUrl } from '../api/client.js'

// Карточка вещи в сетке гардероба: фото, название и «Категория · цвет».
// selected: undefined — обычный режим, true/false — режим выбора (макет 3.10), в углу фото кружок с галочкой.
export default function ItemCard({ item, subtitle, onClick, selected }) {
  const photo = mediaUrl(item.photo?.url)
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '20px',
        border: '1px solid',
        borderColor: selected ? 'text.primary' : 'divider',
        bgcolor: 'background.paper',
        p: 1,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderRadius: '12px',
          bgcolor: 'background.default',
          overflow: 'hidden',
          position: 'relative',
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
        }}
      >
        {photo ? (
          <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <CheckroomOutlined sx={{ fontSize: 40 }} />
        )}
        {selected !== undefined && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: selected ? 'text.primary' : 'common.white',
              bgcolor: selected ? 'text.primary' : (t) => alpha(t.palette.common.white, 0.6),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected && <CheckIcon sx={{ fontSize: 15, color: 'common.white' }} />}
          </Box>
        )}
      </Box>
      <Box sx={{ px: 0.5, pb: 0.5 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 0.25 }} noWrap>
          {item.name}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 13, lineHeight: 1.4 }} noWrap>
          {subtitle}
        </Typography>
      </Box>
    </Box>
  )
}
