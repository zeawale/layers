import { Box } from '@mui/material'

import { mediaUrl } from '../api/client.js'

// Фото профиля; без фото — первая буква имени, а без имени — email (API.md, User.avatar)
export default function Avatar({ user, photo, size = 72 }) {
  const url = mediaUrl((photo === undefined ? user.avatar : photo)?.url)
  const letter = (user.name || user.email || '?').trim().charAt(0).toUpperCase()
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        flexShrink: 0,
        bgcolor: 'primary.main',
        color: 'common.white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Cormorant Garamond", serif',
        fontSize: size * 0.45,
        fontWeight: 500,
      }}
    >
      {url ? <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : letter}
    </Box>
  )
}
