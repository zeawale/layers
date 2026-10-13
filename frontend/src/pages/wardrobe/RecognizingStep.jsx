import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { keyframes } from '@emotion/react'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import InfoOutlined from '@mui/icons-material/InfoOutlined'

import StepList from '../../components/StepList.jsx'

// Золотая линия «сканирования» ходит по фото сверху вниз и обратно. С системной настройкой
// «уменьшить движение» линия стоит посередине
const scan = keyframes`0%, 100% { top: 12%; } 50% { top: 88%; }`
// Уголки рамки видоискателя: [вертикаль, горизонталь]
const CORNERS = [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']]

// Макет 3.5 «Добавление · распознаём». stage: 'upload' — грузим фото, 'recognize' — CLIP думает (несколько секунд)
export default function RecognizingStep({ preview, stage }) {
  const steps = ['Фото загружено', 'Определяем категорию и цвет', 'Предзаполняем форму']
  return (
    <Box>
      <Box sx={{ position: 'relative', aspectRatio: '342 / 400', borderRadius: '24px', overflow: 'hidden', bgcolor: 'background.paper', mb: 2.25 }}>
        <Box component="img" src={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        {CORNERS.map(([v, h]) => (
          <Box
            key={v + h}
            sx={{ position: 'absolute', [v]: 20, [h]: 20, width: 24, height: 24, borderColor: 'common.white', borderStyle: 'solid', borderWidth: 0, [`border${v === 'top' ? 'Top' : 'Bottom'}Width`]: 3, [`border${h === 'left' ? 'Left' : 'Right'}Width`]: 3, [`border${v === 'top' ? 'Top' : 'Bottom'}${h === 'left' ? 'Left' : 'Right'}Radius`]: 8 }}
          />
        ))}
        <Box sx={(t) => ({ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, bgcolor: 'gold.main', boxShadow: `0 0 24px 8px ${alpha(t.palette.gold.main, 0.35)}`, animation: `${scan} 2.4s ease-in-out infinite`, '@media (prefers-reduced-motion: reduce)': { animation: 'none' } })} />
        <Box sx={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 1, height: 38, px: 2, borderRadius: 999, bgcolor: 'text.primary', color: 'common.white', whiteSpace: 'nowrap' }}>
          <AutoAwesomeOutlined sx={{ width: 18, height: 18, color: 'gold.main' }} />
          <Typography variant="body2">Распознаём вещь…</Typography>
        </Box>
      </Box>

      <StepList steps={steps} done={stage === 'upload' ? 0 : 1} sx={{ mb: 2.25 }} />

      <Box sx={{ display: 'flex', gap: 1, color: 'text.disabled' }}>
        <InfoOutlined sx={{ width: 16, height: 16, mt: '2px', flexShrink: 0 }} />
        <Typography variant="body2">Распознавание иногда ошибается — на следующем шаге всё можно поправить.</Typography>
      </Box>
    </Box>
  )
}
