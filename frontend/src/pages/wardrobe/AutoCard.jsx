import { Box, Link, Typography } from '@mui/material'
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined'

import ItemPhoto from '../../components/ItemPhoto.jsx'

// Фото и итог распознавания над формой (макет 3.6): золотистая карточка, если поля заполнились сами,
// белая — если распознать не вышло. «Переснять фото» — вернуться к шагу фото
export default function AutoCard({ src, auto, onRetake }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, p: 1.5, mb: 2.5, borderRadius: '20px', bgcolor: auto ? 'tint.gold' : 'background.paper' }}>
      <ItemPhoto src={src} sx={{ width: 84, aspectRatio: '84 / 100', borderRadius: '14px', bgcolor: 'background.default' }} />
      <Box sx={{ minWidth: 0, py: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          {auto && <AutoAwesomeOutlined sx={{ width: 16, height: 16, flexShrink: 0, color: 'gold.dark' }} />}
          <Typography variant="subtitle1" noWrap>{auto ? 'Заполнили автоматически' : 'Распознать не вышло'}</Typography>
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
          {auto ? 'Проверь поля — любое можно исправить' : 'Заполни поля по фото — это быстро'}
        </Typography>
        <Link component="button" type="button" variant="subtitle2" onClick={onRetake} sx={{ color: 'primary.main' }}>
          Переснять фото
        </Link>
      </Box>
    </Box>
  )
}
