import { Box, Skeleton, Typography } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

import Panel from '../../components/Panel.jsx'

// Плашка скелетона с размерами из макета 2.4
const Bar = ({ w, h, r = 6, sx }) => <Skeleton variant="rounded" width={w} height={h} sx={{ borderRadius: `${r}px`, ...sx }} />

// Макет 2.4 «Сегодня · загрузка»: каркас экрана, пока идёт GET /outfit/today
export default function TodaySkeleton() {
  return (
    <Box aria-busy="true">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2.5 }}>
        <Box>
          <Bar w={140} h={12} sx={{ mb: 1 }} />
          <Bar w={220} h={30} r={8} />
        </Box>
        <Skeleton variant="circular" width={44} height={44} />
      </Box>

      <Panel sx={{ px: 2.75, py: 2.75, mb: 2.5 }}>
        <Bar w={100} h={10} sx={{ mb: 2 }} />
        <Bar w={130} h={52} r={12} sx={{ mb: 2 }} />
        <Bar w={180} h={10} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[0, 1, 2].map((i) => <Bar key={i} w="33%" h={40} r={10} />)}
        </Box>
      </Panel>

      <Bar w={200} h={22} sx={{ mb: 2.5 }} />

      <Panel sx={{ p: 1.5, pb: 1.5, mb: 2.5 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 16fr) minmax(0, 15fr)', gridTemplateRows: '114px 114px', gap: 1, mb: 1.25 }}>
          <Bar w="100%" h="100%" r={16} sx={{ gridRow: 'span 2' }} />
          <Bar w="100%" h="100%" r={16} />
          <Bar w="100%" h="100%" r={16} />
        </Box>
        <Bar w={220} h={16} />
      </Panel>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: 'text.secondary' }}>
        <AutoAwesomeOutlined sx={{ color: 'gold.main', width: 18, height: 18 }} />
        <Typography variant="body2">Смотрим прогноз и собираем комплект…</Typography>
      </Box>
    </Box>
  )
}
