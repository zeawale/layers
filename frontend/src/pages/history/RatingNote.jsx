import { ButtonBase, Typography } from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'

// «Отмечено: нравится» (макет 4.1, на «ты» без рода вместо «Вы отметили») — оценка прошлого дня уже стоит. Нажатие — поменять или снять её
export default function RatingNote({ feedback, onEdit }) {
  const like = feedback.rating === 'like'
  return (
    <ButtonBase
      onClick={onEdit}
      aria-label="Изменить оценку"
      sx={{ width: '100%', justifyContent: 'flex-start', gap: 1.5, minHeight: 52, px: 2.5, borderRadius: '20px', bgcolor: like ? 'tint.secondary' : 'tint.neutral' }}
    >
      {like ? <FavoriteIcon sx={{ color: 'secondary.main' }} /> : <ThumbDownIcon sx={{ color: 'text.secondary' }} />}
      <Typography variant="subtitle1">
        Отмечено: {like ? 'нравится' : 'не нравится'}{feedback.worn ? ', надет' : ''}
      </Typography>
    </ButtonBase>
  )
}
