import { IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Круглая кнопка «назад» как во всех макетах. Ведёт на конкретный экран, а не navigate(-1):
// иначе с первой открытой страницы она уводила бы из приложения
export default function BackButton({ onClick, sx }) {
  return (
    <IconButton
      onClick={onClick}
      aria-label="Назад"
      sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40, ...sx }}
    >
      <ArrowBackIcon sx={{ fontSize: 20 }} />
    </IconButton>
  )
}
