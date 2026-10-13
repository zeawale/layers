import { useId } from 'react'
import { Box, Chip, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// Ряд «таблеток»: один выбор (стиль, защита от осадков) или несколько (сезон).
// Выбранная — тёмная с галочкой, остальные — белые с тонкой рамкой (3.6).
// Подпись группы связана с ней через aria-labelledby — читалка назовёт группу
export default function ToggleRow({ label, options, isActive, onToggle }) {
  const labelId = useId()
  return (
    <Box role="group" aria-labelledby={labelId}>
      <Typography id={labelId} variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((o) => {
          const active = isActive(o.value)
          return (
            <Chip
              key={String(o.value)}
              label={o.label}
              icon={active ? <CheckIcon /> : undefined}
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
              variant="outlined"
              sx={{
                height: 40,
                borderRadius: 999,
                px: 1,
                ...(active
                  ? { bgcolor: 'text.primary', borderColor: 'text.primary', color: 'common.white', '& .MuiChip-icon': { color: 'common.white', width: 16, height: 16 }, '&&:hover': { bgcolor: 'text.primary' } }
                  : { bgcolor: 'background.paper', borderColor: 'divider' }),
              }}
            />
          )
        })}
      </Box>
    </Box>
  )
}
