import { Box, Button, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

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
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (t) => alpha(t.palette.success.main, 0.14),
            color: 'success.main',
          }}
        >
          <CheckroomOutlined sx={{ fontSize: 28 }} />
        </Box>
        <Typography variant="h2" sx={{ mb: 1.5 }}>
          Здесь пока пусто
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3, fontSize: 15, lineHeight: 1.5 }}>
          Добавьте первую вещь — достаточно фото. Категорию и цвет мы определим сами.
        </Typography>
        <Button variant="contained" size="large" fullWidth onClick={onAdd} disabled={!onAdd}>
          Добавить первую вещь
        </Button>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2 }}>
        <Typography sx={{ fontWeight: 600, fontSize: 15, mb: 1.5 }}>С чего начать</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {TIPS.map((tip, i) => (
            <Box key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box
                sx={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'background.default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </Box>
              <Typography sx={{ fontSize: 14, lineHeight: 1.5, color: 'text.secondary' }}>{tip}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}
