import { IconButton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'

// Круглая кнопка «назад»: 44 px, белая, с тонкой зелёной рамкой — заметна и на фото (решение Саши после теста). Ведёт на конкретный экран,
// а не navigate(-1): иначе с первой открытой страницы она уводила бы из приложения.
// close — крестик вместо стрелки: выйти из добавления вещи (3.4)
export default function BackButton({ onClick, close = false, sx }) {
  return (
    <IconButton
      onClick={onClick}
      aria-label={close ? 'Закрыть' : 'Назад'}
      sx={{ border: '1px solid', borderColor: 'primary.main', bgcolor: 'background.paper', width: 44, height: 44, '&:hover': { bgcolor: 'background.paper' }, ...sx }}
    >
      {close ? <CloseIcon fontSize="small" /> : <ArrowBackIcon fontSize="small" />}
    </IconButton>
  )
}
