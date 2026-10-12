import { Box, CircularProgress, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'

// Макет 3.5 «Добавление · распознаём». stage: 'upload' — грузим фото, 'recognize' — CLIP думает (несколько секунд)
export default function RecognizingStep({ preview, stage }) {
  const rows = [
    { text: 'Фото загружено', state: stage === 'upload' ? 'active' : 'done' },
    { text: 'Определяем категорию и цвет', state: stage === 'upload' ? 'wait' : 'active' },
    { text: 'Предзаполняем форму', state: 'wait' },
  ]

  return (
    <Box sx={{ textAlign: 'center' }}>
      <Box
        component="img"
        src={preview}
        alt=""
        sx={{ width: 200, height: 200, objectFit: 'cover', borderRadius: '20px', display: 'block', mx: 'auto', mb: 3 }}
      />
      <Typography variant="h2" sx={{ mb: 3 }}>Распознаём вещь…</Typography>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 3, textAlign: 'left' }}>
        {rows.map((r) => (
          <Box key={r.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
            {r.state === 'done' && <CheckIcon fontSize="small" sx={{ color: 'success.main' }} />}
            {r.state === 'active' && <CircularProgress size={18} sx={{ m: '1px' }} />}
            {r.state === 'wait' && <RadioButtonUncheckedIcon fontSize="small" sx={{ color: 'divider' }} />}
            <Typography sx={{ color: r.state === 'wait' ? 'text.disabled' : 'text.primary' }}>{r.text}</Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
        Распознавание иногда ошибается — на следующем шаге всё можно поправить.
      </Typography>
    </Box>
  )
}
