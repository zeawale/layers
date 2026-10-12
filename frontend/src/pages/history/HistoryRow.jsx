import { Box, ButtonBase, Typography } from '@mui/material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'

import { mediaUrl } from '../../api/client.js'
import ItemPhoto from '../../components/ItemPhoto.jsx'
import { conditionText, formatDayShort, formatTemp } from '../../format.js'

// Строка «Последних комплектов» (макет 4.0): дата, погода, оценка и миниатюры вещей внахлёст.
// У старого комплекта вещей может быть меньше — удалённые вещи из него пропадают (API.md, DELETE /items)
export default function HistoryRow({ outfit, onClick }) {
  const { weather, feedback } = outfit
  const rating = feedback?.rating
  return (
    <ButtonBase
      onClick={onClick}
      sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 1.5, textAlign: 'left', bgcolor: 'background.paper', borderRadius: '20px', minHeight: 74, py: 1.5, pl: 1.875, pr: 1.25 }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>{formatDayShort(outfit.date)}</Typography>
        <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
          {formatTemp(weather.temp_min)} · {conditionText(weather.condition)}
        </Typography>
        {rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, color: rating === 'like' ? 'secondary.main' : 'text.secondary' }}>
            {rating === 'like' ? <FavoriteIcon sx={{ width: 14, height: 14 }} /> : <ThumbDownIcon sx={{ width: 14, height: 14 }} />}
            <Typography variant="body2">{rating === 'like' ? 'понравился' : 'не понравился'}</Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexShrink: 0 }}>
        {/* Превью — не больше четырёх миниатюр, как в макете: иначе на 390 px не останется места дате */}
        {outfit.items.slice(0, 4).map((item, i) => (
          <ItemPhoto
            key={item.id}
            src={mediaUrl(item.photo?.url)}
            sx={{ width: 46, borderRadius: '12px', bgcolor: 'background.default', border: '2px solid', borderColor: 'background.paper', ml: i ? '-10px' : 0, '& svg': { width: 20, height: 20 } }}
          />
        ))}
      </Box>
      <ChevronRightIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
    </ButtonBase>
  )
}
