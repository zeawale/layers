import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

import { setToken } from '../api/client.js'
import { listItems } from '../api/items.js'
import { getHistory } from '../api/outfit.js'
import { getMe } from '../api/users.js'
import Avatar from '../components/Avatar.jsx'
import useAttributes from '../hooks/useAttributes.js'

function Stat({ value, label }) {
  return (
    <Box sx={{ flex: 1, textAlign: 'center' }}>
      <Typography sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 30, fontWeight: 500, lineHeight: 1.1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
    </Box>
  )
}

function Row({ title, value, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1.75, cursor: onClick ? 'pointer' : 'default' }}
    >
      <Typography sx={{ fontSize: 15, flex: 1 }}>{title}</Typography>
      {value && <Typography sx={{ fontSize: 15, color: 'text.secondary', textAlign: 'right' }}>{value}</Typography>}
      {onClick && <ChevronRightIcon sx={{ color: 'text.disabled' }} />}
    </Box>
  )
}

// Макет «Профиль» (раздел 04). Правка города, стиля и цветов — следующим шагом, на частях онбординга
export default function Profile() {
  const navigate = useNavigate()
  const { label } = useAttributes()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    setError('')
    getMe().then(setUser).catch((err) => setError(err.message))
    // Счётчики — необязательная часть экрана: не пришли, просто не показываем
    Promise.all([listItems(), getHistory()])
      .then(([items, history]) => {
        const rated = history.outfits.filter((o) => o.feedback?.rating)
        const liked = rated.filter((o) => o.feedback.rating === 'like').length
        setStats({
          items: items.total,
          outfits: history.total,
          liked: rated.length ? `${Math.round((liked / rated.length) * 100)}%` : '—',
        })
      })
      .catch(() => setStats(null))
  }, [attempt])

  function logout() {
    setToken(null)
    navigate('/login', { replace: true })
  }

  if (error) {
    return (
      <Box sx={{ px: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        <Button variant="outlined" onClick={() => setAttempt((n) => n + 1)}>Повторить</Button>
      </Box>
    )
  }

  if (!user) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress size={28} /></Box>
  }

  const prefs = user.preferences ?? {}
  const colors = (list) => (list?.length ? list.map((c) => label('color', c)).join(' · ') : '—')
  const since = new Date(user.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })

  return (
    <Box sx={{ px: 3, pt: 4, pb: 2 }}>
      <Typography variant="h1" sx={{ mb: 3 }}>Профиль</Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar user={user} />
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 19 }} noWrap>{user.name || 'Без имени'}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>{user.email}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>В сервисе с {since}</Typography>
        </Box>
      </Box>

      {stats && (
        <Box sx={{ display: 'flex', bgcolor: 'background.paper', borderRadius: '20px', py: 2, mb: 3 }}>
          <Stat value={stats.items} label="вещи" />
          {/* История отдаёт последние 30 дней — столько комплектов и считаем */}
          <Stat value={stats.outfits} label="комплектов" />
          <Stat value={stats.liked} label="понравилось" />
        </Box>
      )}

      <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', px: 2, mb: 2, '& > div + div': { borderTop: '1px solid', borderColor: 'divider' } }}>
        <Row title="Имя" value={user.name || 'не указано'} onClick={() => navigate('/profile/name')} />
        <Row title="Город" value={user.city || 'не указан'} />
        <Row title="Мой стиль" value={prefs.style ? label('style', prefs.style) : 'любой'} />
        <Row title="Люблю" value={colors(prefs.liked_colors)} />
        <Row title="Не ношу" value={colors(prefs.disliked_colors)} />
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', px: 2, mb: 3 }}>
        <Row title="Сменить пароль" onClick={() => navigate('/profile/password')} />
      </Box>

      <Button variant="outlined" color="error" size="large" fullWidth onClick={logout} sx={{ borderColor: 'divider' }}>
        Выйти из аккаунта
      </Button>

      {/* Лицензии Open-Meteo и OpenStreetMap требуют подписи (API.md, «Подписи источников данных») */}
      <Typography variant="body2" align="center" sx={{ color: 'text.disabled', fontSize: 11, mt: 3 }}>
        Погода и поиск городов: Open-Meteo.com. Город по координатам: © OpenStreetMap
      </Typography>
    </Box>
  )
}
