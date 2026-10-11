import { useRef } from 'react'
import { Box, Button, Link, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined'

const TIPS = ['Вещь целиком в кадре', 'Однотонный фон — пол или кровать', 'Дневной свет, без вспышки']
const ACCEPT = 'image/jpeg,image/png,image/webp'

// Макет 3.4 «Добавление · фото»
export default function PhotoStep({ onFile, onManual }) {
  const cameraRef = useRef(null)
  const galleryRef = useRef(null)

  function pick(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы тот же файл можно было выбрать ещё раз
    if (file) onFile(file)
  }

  return (
    <Box>
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: '20px',
          p: 3,
          textAlign: 'center',
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.success.main, 0.14),
            color: 'success.main',
          }}
        >
          <PhotoCameraOutlined sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h2" sx={{ mb: 1 }}>Сфотографируйте вещь</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: 14, lineHeight: 1.5, mb: 3 }}>
          или загрузите из галереи. JPG, PNG или WEBP до 10 МБ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" size="large" fullWidth startIcon={<PhotoCameraOutlined />} onClick={() => cameraRef.current.click()}>
            Камера
          </Button>
          <Button
            variant="outlined"
            size="large"
            fullWidth
            startIcon={<PhotoLibraryOutlined />}
            onClick={() => galleryRef.current.click()}
            sx={{ borderColor: 'divider', color: 'text.primary' }}
          >
            Галерея
          </Button>
        </Box>
        {/* На телефоне capture открывает камеру сразу, на компьютере — обычный выбор файла */}
        <input ref={cameraRef} type="file" accept={ACCEPT} capture="environment" hidden onChange={pick} />
        <input ref={galleryRef} type="file" accept={ACCEPT} hidden onChange={pick} />
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 3 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 1.5 }}>Как получить хорошее фото</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {TIPS.map((tip) => (
            <Box key={tip} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <CheckIcon sx={{ fontSize: 18, color: 'success.main' }} />
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{tip}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Typography align="center">
        <Link component="button" type="button" onClick={onManual} sx={{ fontWeight: 600, color: 'text.primary', fontSize: 15 }}>
          Заполнить вручную, без фото
        </Link>
      </Typography>
    </Box>
  )
}
