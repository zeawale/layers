import { Box, Button, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'

import { plural } from '../../format.js'
import ProfileCard from './ProfileCard.jsx'
import StatTile from './StatTile.jsx'

// Комплекты с «Нравится» — сердце, как на кнопке «Нравится» на главном (2.0), вместо подписи
const LIKE_ICON = <FavoriteIcon titleAccess="с «Нравится»" sx={{ width: 20, height: 20, color: 'secondary.main' }} />

// Ряд счётчиков 4.2. Пока грузятся — три плитки со скелетоном, не загрузились — строка той же высоты
// с «Повторить»: счётчики не главное на экране, большой LoadError с красной плашкой здесь лишний
export default function ProfileStats({ stats, error, onRetry }) {
  if (error) {
    return (
      <ProfileCard sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.25 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Счётчики не загрузились</Typography>
        <Button variant="text" onClick={onRetry} sx={{ flexShrink: 0, px: 1.5, mr: -1 }}>Повторить</Button>
      </ProfileCard>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {stats ? (
        <>
          <StatTile value={stats.items} label={plural(stats.items, ['вещь', 'вещи', 'вещей'])} />
          <StatTile value={stats.outfits} label={plural(stats.outfits, ['комплект', 'комплекта', 'комплектов'])} />
          <StatTile value={stats.liked} icon={LIKE_ICON} />
        </>
      ) : (
        [0, 1, 2].map((i) => <StatTile key={i} loading />)
      )}
    </Box>
  )
}
