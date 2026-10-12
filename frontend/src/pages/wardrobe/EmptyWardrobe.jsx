import { Box, Button, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined'

const TIPS = [
  '10–15 базовых вещей на сезон',
  'Верхняя одежда и обувь — они важнее всего для погоды',
  'Остальное — постепенно, по мере носки',
]

// Карточка иллюстрации 132×164: пунктирная белая (по бокам, повёрнута) или зелёная с «+» (по центру)
const CARD = { position: 'absolute', top: 0, left: '50%', width: 132, height: 164, ml: '-66px', borderRadius: '20px' }

// Иллюстрация 3.1: три карточки веером — пустые места под вещи и зелёная с «+» посередине
function Illustration({ onAdd }) {
  return (
    <Box sx={{ position: 'relative', width: 216, height: 166, mx: 'auto', mb: 5.5 }}>
      {[-7, 7].map((deg) => (
        <Box
          key={deg}
          sx={{ ...CARD, bgcolor: 'background.paper', border: '1.5px dashed', borderColor: 'outline.main', transform: `translateX(${deg * 6}px) rotate(${deg}deg)` }}
        />
      ))}
      <Box sx={{ ...CARD, bgcolor: 'tint.success', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="button"
          type="button"
          onClick={onAdd}
          aria-label="Добавить вещь"
          sx={{ width: 64, height: 64, borderRadius: '50%', border: 0, cursor: 'pointer', bgcolor: 'background.paper', color: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <AddIcon sx={{ width: 32, height: 32 }} />
        </Box>
      </Box>
    </Box>
  )
}

// Макет 3.1 «Гардероб · пусто»
export default function EmptyWardrobe({ onAdd }) {
  return (
    <Box sx={{ pt: 5.5 }}>
      <Illustration onAdd={onAdd} />
      <Box sx={{ textAlign: 'center', mb: 2.5 }}>
        <Typography variant="h2" sx={{ mb: 1.5 }}>Здесь пока пусто</Typography>
        <Typography sx={{ color: 'text.secondary', mb: 2.5 }}>
          Добавь первую вещь — достаточно фото. Категорию и цвет мы определим сами.
        </Typography>
        <Button variant="contained" size="large" fullWidth startIcon={<PhotoCameraOutlined />} onClick={onAdd}>
          Добавить первую вещь
        </Button>
      </Box>

      <Box sx={{ bgcolor: 'background.paper', borderRadius: '20px', p: 2.25 }}>
        <Typography variant="subtitle1" sx={{ mb: 1.5 }}>С чего начать</Typography>
        <Box component="ol" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, m: 0, p: 0, listStyle: 'none' }}>
          {TIPS.map((tip, i) => (
            <Box component="li" key={tip} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Typography
                variant="subtitle2"
                component="span"
                aria-hidden
                sx={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', bgcolor: 'tint.neutral', color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
