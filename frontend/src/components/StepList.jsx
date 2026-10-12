import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// Чек-лист этапов в белой карточке (макеты 1.7 «Подбираем первый комплект» и 3.5 «Распознаём»):
// пройденные — зелёный кружок с галочкой, текущий — тёмное кольцо, остальные — бледные.
// steps — подписи, done — сколько уже пройдено
export default function StepList({ steps, done, sx }) {
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: '24px', px: 2.5, py: 1.25, textAlign: 'left', ...sx }}>
      {steps.map((text, i) => {
        const state = i < done ? 'done' : i === done ? 'active' : 'todo'
        return (
          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, height: 40 }}>
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
            <Typography sx={{ color: state === 'todo' ? 'text.disabled' : 'text.primary' }}>{text}</Typography>
          </Box>
        )
      })}
    </Box>
  )
}
