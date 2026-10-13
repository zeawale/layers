import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'

import { setToken } from '../api/client.js'
import { getMe } from '../api/users.js'
import Avatar from '../components/Avatar.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import SourcesNote from '../components/SourcesNote.jsx'
import { plural } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'
import ColorRow from './profile/ColorRow.jsx'
import PhotoSheet from './profile/PhotoSheet.jsx'
import ProfileCard, { CardHeader } from './profile/ProfileCard.jsx'
import SettingsRow from './profile/SettingsRow.jsx'
import StatTile from './profile/StatTile.jsx'
import useProfileStats from './profile/useProfileStats.js'

function since(createdAt) {
  const date = new Date(createdAt)
  const sameYear = date.getFullYear() === new Date().getFullYear()
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', ...(!sameYear && { year: 'numeric' }) })
}

// Макет 4.2 «Профиль»
export default function Profile() {
  const navigate = useNavigate()
  const { label } = useAttributes()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [photoOpen, setPhotoOpen] = useState(false)
  const stats = useProfileStats(user)

  useEffect(() => {
    setError('')
    getMe().then(setUser).catch((err) => setError(err.message))
  }, [attempt])

  function logout() {
    setToken(null)
    navigate('/login', { replace: true })
  }

  if (error) return <Box sx={{ px: 3, pt: 4 }}><LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} /></Box>
  if (!user) return <Loading />

  const prefs = user.preferences

  return (
    // Макет 4.2: заголовок и карточки через 20 px
    <Box sx={{ px: 3, pt: 2.5, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Typography variant="h2" component="h1">Профиль</Typography>

      <ProfileCard sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          component="button"
          type="button"
          onClick={() => setPhotoOpen(true)}
          aria-label="Фото профиля"
          sx={{ all: 'unset', position: 'relative', cursor: 'pointer', borderRadius: '50%' }}
        >
          <Avatar user={user} />
          <Box
            sx={{
              position: 'absolute', right: -2, bottom: -2,
              width: 28, height: 28, borderRadius: '50%',
              bgcolor: 'primary.main', color: 'common.white',
              border: '2px solid', borderColor: 'background.paper',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <PhotoCameraOutlinedIcon fontSize="inherit" />
          </Box>
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h3" noWrap>{user.name || 'Без имени'}</Typography>
          <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>{user.email}</Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>В сервисе с {since(user.created_at)}</Typography>
        </Box>
      </ProfileCard>

      {stats && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <StatTile value={stats.items} label={plural(stats.items, ['вещь', 'вещи', 'вещей'])} />
          <StatTile value={stats.outfits} label={plural(stats.outfits, ['комплект', 'комплекта', 'комплектов'])} />
          <StatTile value={stats.liked} label="понравилось" />
        </Box>
      )}

      <ProfileCard>
        <CardHeader title="Мой стиль" onEdit={() => navigate('/profile/style')} />
        {prefs.style ? (
          <Box
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 1,
              px: 2, py: 1, borderRadius: 999,
              bgcolor: 'text.primary', color: 'background.paper',
            }}
          >
            <CheckIcon fontSize="small" />
            <Typography variant="subtitle1" component="span">{label('style', prefs.style)}</Typography>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>Не выбран — подбираем вещи любого стиля</Typography>
        )}
      </ProfileCard>

      <ProfileCard>
        <CardHeader title="Цвета" onEdit={() => navigate('/profile/colors')} />
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
          <ColorRow title="Люблю" values={prefs.liked_colors} label={label} />
          <ColorRow title="Не ношу" values={prefs.disliked_colors} label={label} />
        </Box>
      </ProfileCard>

      <ProfileCard sx={{ py: 2 }}>
        <SettingsRow icon={<PersonOutlineIcon fontSize="small" />} title="Имя" value={user.name} onClick={() => navigate('/profile/name')} />
        <SettingsRow icon={<LocationOnOutlinedIcon fontSize="small" />} title="Город" value={user.city} onClick={() => navigate('/profile/city')} />
        <SettingsRow icon={<LockOutlinedIcon fontSize="small" />} title="Сменить пароль" onClick={() => navigate('/profile/password')} />
      </ProfileCard>

      <Button variant="text" color="error" onClick={logout} sx={{ alignSelf: 'center', minHeight: 36 }}>
        Выйти из аккаунта
      </Button>

      <SourcesNote />

      <PhotoSheet open={photoOpen} user={user} onClose={() => setPhotoOpen(false)} onChange={setUser} />
    </Box>
  )
}
