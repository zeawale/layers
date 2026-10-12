import { Box, Button, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'
import ThumbDownOutlined from '@mui/icons-material/ThumbDownOutlined'

// Вид кнопок по макетам 2.0 и 2.3. Нажатое «Не нравится» и отметка «надет» в макетах не нарисованы —
// по аналогии: сплошная заливка и белый текст
const LIKE = {
  off: { bgcolor: 'tint.secondary', borderColor: 'divider', color: 'text.primary' },
  on: { bgcolor: 'secondary.main', borderColor: 'secondary.main', color: 'common.white' },
}
const DISLIKE = {
  off: { bgcolor: 'transparent', borderColor: 'outline.main', color: 'text.primary' },
  on: { bgcolor: 'text.primary', borderColor: 'text.primary', color: 'common.white' },
}
const WORN = {
  off: { bgcolor: 'tint.success', color: 'primary.main' },
  on: { bgcolor: 'primary.main', color: 'common.white' },
}
// Цвет не меняется при наведении и пока идёт запрос — иначе кнопка мигает серым
const keep = (style) => ({ ...style, '&:hover': style, '&.Mui-disabled': style })

// «Нравится», «Не нравится» и «Отметить: надет сегодня» (макеты 2.0, 2.3).
// feedback — из Outfit (null, пока ничего не отмечено). Повторное нажатие снимает оценку или отметку
export default function FeedbackBar({ feedback, busy, onRate, onWorn }) {
  const rating = feedback?.rating
  const worn = Boolean(feedback?.worn)
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, mb: 1.5 }}>
        <Button
          variant="outlined"
          disabled={busy}
          aria-pressed={rating === 'like'}
          onClick={() => onRate('like')}
          startIcon={rating === 'like' ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          sx={keep(LIKE[rating === 'like' ? 'on' : 'off'])}
        >
          {rating === 'like' ? 'Нравится!' : 'Нравится'}
        </Button>
        <Button
          variant="outlined"
          disabled={busy}
          aria-pressed={rating === 'dislike'}
          onClick={() => onRate('dislike')}
          startIcon={rating === 'dislike' ? <ThumbDownIcon /> : <ThumbDownOutlined />}
          sx={keep(DISLIKE[rating === 'dislike' ? 'on' : 'off'])}
        >
          Не нравится
        </Button>
      </Box>
      <Button
        fullWidth
        disabled={busy}
        aria-pressed={worn}
        onClick={onWorn}
        startIcon={<CheckIcon />}
        sx={{ minHeight: 47, ...keep(WORN[worn ? 'on' : 'off']) }}
      >
        {worn ? 'Надет сегодня' : 'Отметить: надет сегодня'}
      </Button>
      <Typography variant="caption" component="p" align="center" sx={{ color: 'text.disabled', mt: 1.5, px: 3 }}>
        {worn ? 'Снимите отметку, чтобы сменить вариант' : 'После отметки «надет» варианты на сегодня не меняются'}
      </Typography>
    </Box>
  )
}
