import { useRef } from 'react'
import { Box, Button, Link, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'
import PhotoLibraryOutlined from '@mui/icons-material/PhotoLibraryOutlined'

import IconCircle from '../../components/IconCircle.jsx'

const TIPS = ['Вещь целиком в кадре', 'Однотонный фон — пол или кровать', 'Дневной свет, без вспышки']
const ACCEPT = 'image/jpeg,image/png,image/webp'

// Макет 3.4 «Добавление · фото». error — 413/415 под кнопками; пока фото грузится, на экране «Распознаём» (3.5)
export default function PhotoStep({ onFile, onManual, error }) {
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
        <IconCircle sx={{ mx: 'auto', mb: 2 }}><PhotoCameraOutlined /></IconCircle>
        <Typography variant="h2" sx={{ mb: 1 }}>Сфотографируй вещь</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          или загрузи из галереи. JPG, PNG или WEBP до 10 МБ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" size="large" fullWidth startIcon={<PhotoCameraOutlined />} onClick={() => cameraRef.current.click()}>
            Камера
          </Button>
          <Button variant="outlined" size="large" fullWidth startIcon={<PhotoLibraryOutlined />} onClick={() => galleryRef.current.click()}>
            Галерея
          </Button>
        </Box>
        {error && <Typography variant="body2" role="alert" sx={{ color: 'error.main', mt: 2 }}>{error}</Typography>}
        {/* На телефоне capture открывает камеру сразу, на компьютере — обычный выбор файла */}
        <input ref={cameraRef} type="file" accept={ACCEPT} capture="environment" hidden onChange={pick} />
        <input ref={galleryRef} type="file" accept={ACCEPT} hidden onChange={pick} />
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>Как получить хорошее фото</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {TIPS.map((tip) => (
            <Box key={tip} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tip}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Typography align="center">
        <Link component="button" type="button" variant="subtitle1" onClick={onManual} sx={{ color: 'text.primary' }}>
          Заполнить вручную, без фото
        </Link>
      </Typography>
    </Box>
  )
}
