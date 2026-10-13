import { Box, Typography } from '@mui/material'

import CheckCircle from './CheckCircle.jsx'
import Panel from './Panel.jsx'

// Чек-лист этапов в белой карточке (макеты 1.7 «Подбираем первый комплект» и 3.5 «Распознаём»):
// пройденные — зелёный кружок с галочкой, текущий — тёмное кольцо, остальные — бледные.
// steps — подписи, done — сколько уже пройдено
export default function StepList({ steps, done, sx }) {
  return (
    <Panel sx={{ px: 2.5, py: 1.25, textAlign: 'left', ...sx }}>
      {steps.map((text, i) => {
        const state = i < done ? 'done' : i === done ? 'active' : 'todo'
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 40 }}>
            <CheckCircle checked={state === 'done'} ring={state === 'active' ? 'text.primary' : 'divider'} />
            <Typography sx={{ color: state === 'todo' ? 'text.disabled' : 'text.primary' }}>{text}</Typography>
          </Box>
        )
      })}
    </Panel>
  )
}
