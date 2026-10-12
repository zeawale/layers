import { Box, LinearProgress, Typography } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'
import CheckIcon from '@mui/icons-material/Check'

import Panel from '../../components/Panel.jsx'

function Step({ state, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 40 }}>
      <Box
        sx={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid',
          borderColor: state === 'done' ? 'primary.main' : state === 'active' ? 'text.primary' : 'divider',
          bgcolor: state === 'done' ? 'primary.main' : 'transparent',
          color: 'common.white',
        }}
      >
        {state === 'done' && <CheckIcon sx={{ width: 16, height: 16 }} />}
      </Box>
      <Typography sx={{ color: state === 'todo' ? 'text.disabled' : 'text.primary' }}>{children}</Typography>
    </Box>
  )
}

// Макеты 1.7 «Подбираем первый комплект» и 1.7b «почти готово» — сразу после онбординга, пока идёт первый подбор.
// steps — подписи шагов, done — сколько шагов уже отмечено. Во весь экран поверх нижней панели
export default function FirstOutfit({ steps, done }) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 20, bgcolor: 'background.default', overflowY: 'auto' }}>
      <Box sx={{ maxWidth: 390, mx: 'auto', px: 3, pt: 6.5, pb: 4, textAlign: 'center' }}>
        <Box component="img" src="/today/first-outfit.png" alt="" sx={{ width: 260, height: 242, display: 'block', mx: 'auto', mb: 5 }} />
        <AutoAwesomeOutlined sx={{ color: 'gold.main', width: 24, height: 24, mb: 1.5 }} />
        <Typography variant="h2" component="h1" sx={{ mb: 1.5 }}>Собираем ваш первый комплект</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5 }}>Обычно это занимает пару секунд</Typography>
        <Panel sx={{ px: 2.5, py: 1.25, mb: 3.5, textAlign: 'left' }}>
          {steps.map((text, i) => (
            <Step key={i} state={i < done ? 'done' : i === done ? 'active' : 'todo'}>{text}</Step>
          ))}
        </Panel>
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
