import { Box, Button, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import ThumbDownAltOutlined from '@mui/icons-material/ThumbDownAltOutlined'
import ThumbUpAltOutlined from '@mui/icons-material/ThumbUpAltOutlined'

// Оценка и «надет» — низ макета 2.0 (состояние «оценка отправлена» — 2.3) и экран дня в истории.
// today — на главном экране: подпись «надет сегодня» и пояснение про варианты.
export default function FeedbackBar({ feedback, busy, onRate, onWorn, today = true }) {
  const rating = feedback?.rating ?? null
  const worn = Boolean(feedback?.worn)

  // Повторное нажатие на ту же оценку её снимает (rating: null)
  const rate = (value) => onRate(rating === value ? null : value)
  const idle = { borderColor: 'divider', color: 'text.primary', bgcolor: 'background.paper' }
  const fit = { px: 2, whiteSpace: 'nowrap' }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        <Button
          variant={rating === 'like' ? 'contained' : 'outlined'}
          size="large"
          fullWidth
          startIcon={<ThumbUpAltOutlined />}
          onClick={() => rate('like')}
          disabled={busy}
          sx={rating === 'like' ? fit : { ...fit, ...idle }}
        >
          {rating === 'like' ? 'Нравится!' : 'Нравится'}
        </Button>
        <Button
          variant={rating === 'dislike' ? 'contained' : 'outlined'}
          color={rating === 'dislike' ? 'secondary' : 'primary'}
          size="large"
          fullWidth
          startIcon={<ThumbDownAltOutlined />}
          onClick={() => rate('dislike')}
          disabled={busy}
          sx={rating === 'dislike' ? fit : { ...fit, ...idle }}
        >
          Не нравится
        </Button>
      </Box>

      <Button
        variant={worn ? 'contained' : 'outlined'}
        color={worn ? 'success' : 'primary'}
        size="large"
        fullWidth
        startIcon={worn ? <CheckIcon /> : null}
        onClick={() => onWorn(!worn)}
        disabled={busy}
        sx={worn ? undefined : { borderColor: 'text.primary', color: 'text.primary' }}
      >
        {worn
          ? `Надет ${today ? 'сегодня' : 'в этот день'} — снять отметку`
          : `Отметить: надет ${today ? 'сегодня' : 'в этот день'}`}
      </Button>
      {today && (
        <Typography variant="body2" align="center" sx={{ color: 'text.secondary', fontSize: 12 }}>
          После отметки «надет» варианты на сегодня не меняются
        </Typography>
      )}
    </Box>
  )
}
