import { Box, Typography } from '@mui/material'

import { mediaUrl } from '../api/client.js'

// Фото профиля; без фото — первая буква имени, без имени — почты (API.md, User.avatar)
export default function Avatar({ user, size = 72 }) {
  const url = mediaUrl(user.avatar?.url)
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
      }}
    >
      {url ? (
        <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <Typography variant="h2" component="span">{letter}</Typography>
      )}
    </Box>
  )
}
