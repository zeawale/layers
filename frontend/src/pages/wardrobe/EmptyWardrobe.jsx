import { Box, Button, Typography } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import IconCircle from '../../components/IconCircle.jsx'

const TIPS = [
  '10–15 базовых вещей на сезон',
  'Верхняя одежда и обувь — они важнее всего для погоды',
  'Остальное — постепенно, по мере носки',
]

// Макет 3.1 «Гардероб · пусто»
export default function EmptyWardrobe({ onAdd }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', pt: 4, mb: 4 }}>
        <IconCircle sx={{ mb: 3 }}><CheckroomOutlined /></IconCircle>
        <Typography variant="h2" sx={{ mb: 1.5 }}>Здесь пока пусто</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Добавьте первую вещь — достаточно фото. Категорию и цвет мы определим сами.
        </Typography>
        <Button variant="contained" size="large" fullWidth onClick={onAdd} disabled={!onAdd}>
          Добавить первую вещь
        </Button>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>С чего начать</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {TIPS.map((tip, i) => (
            <Box key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography
                variant="subtitle2"
                component="span"
                sx={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {i + 1}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{tip}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
