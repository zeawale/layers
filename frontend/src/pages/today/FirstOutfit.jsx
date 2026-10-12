import { Box, LinearProgress, Typography } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

import StepList from '../../components/StepList.jsx'

// Макеты 1.7 «Подбираем первый комплект» и 1.7b «почти готово» — сразу после онбординга, пока идёт первый подбор.
// steps — подписи шагов, done — сколько шагов уже отмечено. Во весь экран поверх нижней панели
export default function FirstOutfit({ steps, done }) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'background.default', overflowY: 'auto' }}>
      <Box sx={{ maxWidth: 390, mx: 'auto', px: 3, pt: 6.5, pb: 4, textAlign: 'center' }}>
        <Box component="img" src="/today/first-outfit.png" alt="" sx={{ width: 260, height: 242, display: 'block', mx: 'auto', mb: 5 }} />
        <AutoAwesomeOutlined sx={{ color: 'gold.main', width: 24, height: 24, mb: 1.5 }} />
        <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>Собираем твой первый комплект</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>Обычно это занимает пару секунд</Typography>
        <StepList steps={steps} done={done} sx={{ mb: 3.5 }} />
        <LinearProgress
          variant="determinate"
          value={(done / steps.length) * 100}
          aria-label="Подбор комплекта"
          sx={{ height: 6, borderRadius: 999, bgcolor: 'divider', '& .MuiLinearProgress-bar': { borderRadius: 999 } }}
        />
      </Box>
    </Box>
  )
}
