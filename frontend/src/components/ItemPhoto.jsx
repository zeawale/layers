import { useState } from 'react'
import { Box } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

// Квадратное фото вещи: в сетке, на карточке вещи и миниатюрой в форме.
// Нет фото или оно не загрузилось — иконка вешалки. children — поверх фото (галочка, спиннер).
// position — какую часть фото оставить в квадрате; sx — размер, скругление и фон под место.
// contain — фото целиком, без обрезки: длинные брюки и платья не теряют низ, поля вокруг — цвет фона
export default function ItemPhoto({ src, position = 'center', contain = false, children, sx }) {
  const [failed, setFailed] = useState(false)
  // Новое фото (замена в форме) — пробуем показать заново
  const [prevSrc, setPrevSrc] = useState(src)
  if (src !== prevSrc) {
    setPrevSrc(src)
    setFailed(false)
  }
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '1 / 1',
        flexShrink: 0,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'text.disabled',
        ...sx,
      }}
    >
      {src && !failed ? (
        <Box
          component="img"
          src={src}
          alt=""
          onError={() => setFailed(true)}
          sx={{ width: '100%', height: '100%', objectFit: contain ? 'contain' : 'cover', objectPosition: position, display: 'block' }}
        />
      ) : (
        <CheckroomOutlined fontSize="large" />
      )}
      {children}
    </Box>
  )
}
