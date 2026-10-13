import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined'

import { setToken } from '../api/client.js'
import { listItems } from '../api/items.js'
import { getHistory } from '../api/outfit.js'
import { getMe } from '../api/users.js'
import Avatar from '../components/Avatar.jsx'
import ColorDot from '../components/ColorDot.jsx'
import IconCircle from '../components/IconCircle.jsx'
import { LoadError, Loading } from '../components/LoadState.jsx'
import SourcesNote from '../components/SourcesNote.jsx'
import { plural } from '../format.js'
import useAttributes from '../hooks/useAttributes.js'
import PhotoSheet from './profile/PhotoSheet.jsx'

function Card({ children, sx }) {
  return <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2, ...sx }}>{children}</Box>
}

// Заголовок карточки со ссылкой «Изменить» справа
function CardHeader({ title, onEdit }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography variant="h4" component="h2">{title}</Typography>
      <Button variant="text" size="small" onClick={onEdit} sx={{ minHeight: 0, px: 1, mr: -1, color: 'text.primary' }}>
        Изменить
      </Button>
    </Box>
  )
}

function Stat({ value, label }) {
  return (
    <Card sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="h3">{value}</Typography>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Card>
  )
}

function ColorRow({ title, values, label }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minHeight: 36 }}>
      <Typography variant="subtitle2" sx={{ color: 'text.secondary', width: 64, flexShrink: 0 }}>{title}</Typography>
      {values.length ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {values.map((value) => <ColorDot key={value} value={value} label={label('color', value)} />)}
        </Box>
      ) : (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>не выбраны</Typography>
      )}
    </Box>
  )
}

function SettingsRow({ icon, title, value, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{ all: 'unset', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', gap: 2, py: 1.25, cursor: 'pointer' }}
    >
      <IconCircle tone="neutral" size={40}>{icon}</IconCircle>
      <Typography variant="subtitle1" component="span" sx={{ flex: 1 }}>{title}</Typography>
      {value && (
        <Typography component="span" noWrap sx={{ color: 'text.secondary', maxWidth: 140 }}>{value}</Typography>
      )}
      <ChevronRightIcon sx={{ color: 'text.disabled' }} />
    </Box>
  )
}

// Счётчики под шапкой — полей в API нет, считаем сами: вещи — из гардероба,
// комплекты и доля «Нравится» — из истории с даты регистрации
function useStats(user) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    if (!user) return
    Promise.all([listItems(), getHistory({ from: user.created_at.slice(0, 10) })])
      .then(([wardrobe, history]) => {
        const rated = history.outfits.filter((outfit) => outfit.feedback?.rating)
        const liked = rated.filter((outfit) => outfit.feedback.rating === 'like').length
        setStats({
          items: wardrobe.total,
          outfits: history.total,
          liked: rated.length ? `${Math.round((liked / rated.length) * 100)}%` : '—',
        })
      })
      // Счётчики — не главное на экране: не пришли — просто не показываем
      .catch(() => setStats(null))
  }, [user])
  return stats
}

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
  const stats = useStats(user)

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
    <Box sx={{ px: 3, pt: 4, pb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>Профиль</Typography>

      <Card sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
      </Card>

      {stats && (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Stat value={stats.items} label={plural(stats.items, ['вещь', 'вещи', 'вещей'])} />
          <Stat value={stats.outfits} label={plural(stats.outfits, ['комплект', 'комплекта', 'комплектов'])} />
          <Stat value={stats.liked} label="понравилось" />
        </Box>
      )}

      <Card>
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
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Не выбран — подбираем вещи любого стиля</Typography>
        )}
      </Card>

      <Card>
        <CardHeader title="Цвета" onEdit={() => navigate('/profile/colors')} />
        <ColorRow title="Люблю" values={prefs.liked_colors} label={label} />
        <ColorRow title="Не ношу" values={prefs.disliked_colors} label={label} />
      </Card>

      <Card sx={{ py: 1, '& > button + button': { borderTop: '1px solid', borderColor: 'divider' } }}>
        <SettingsRow icon={<PersonOutlineIcon fontSize="small" />} title="Имя" value={user.name} onClick={() => navigate('/profile/name')} />
        <SettingsRow icon={<LocationOnOutlinedIcon fontSize="small" />} title="Город" value={user.city} onClick={() => navigate('/profile/city')} />
        <SettingsRow icon={<LockOutlinedIcon fontSize="small" />} title="Сменить пароль" onClick={() => navigate('/profile/password')} />
      </Card>

      <Button variant="text" color="error" size="large" onClick={logout} sx={{ alignSelf: 'center' }}>
        Выйти из аккаунта
      </Button>

      <SourcesNote />

      <PhotoSheet open={photoOpen} user={user} onClose={() => setPhotoOpen(false)} onChange={setUser} />
    </Box>
  )
}
