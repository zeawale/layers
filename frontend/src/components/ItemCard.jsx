import { Box, Typography } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { mediaUrl } from '../api/client.js'

// Карточка вещи в сетке гардероба: фото, название и «Категория · цвет».
export default function ItemCard({ item, subtitle, onClick }) {
  const photo = mediaUrl(item.photo?.url)
  return (
    <Box
      onClick={onClick}
      sx={{
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
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
