import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'

// Кружок цвета справочника. Цвет — из theme.palette.swatch по машинному значению
function Swatch({ color, active, taken, tone, onClick }) {
  return (
    <Box
      onClick={taken ? undefined : onClick}
      title={taken ? `${color.label} — уже в другом списке` : color.label}
      sx={(t) => {
        const fill = t.palette.swatch[color.value] ?? t.palette.swatch.unknown
        return {
          width: 44,
          height: 44,
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          cursor: taken ? 'default' : 'pointer',
          background: fill,
          border: active ? '3px solid' : '1px solid',
          borderColor: active ? `${tone}.main` : 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Занятый в другом списке цвет виден, но приглушён и перечёркнут
          ...(taken && {
            '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: alpha(t.palette.background.paper, 0.45) },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '130%',
              height: 2,
              bgcolor: 'text.secondary',
              transform: 'rotate(-45deg)',
            },
          }),
          // Галочка контрастная к цвету кружка; у разноцветного фона — белая
          '& svg': { color: fill.startsWith('#') ? t.palette.getContrastText(fill) : t.palette.common.white },
        }
      }}
    >
      {active && <CheckIcon fontSize="small" />}
    </Box>
  )
}

// Блок выбора цветов — «Люблю носить» и «Не ношу» в онбординге и профиле.
// taken — цвета из соседнего списка: один цвет не может быть в обоих (API.md, User.preferences).
// tone — цвет обводки и счётчика: primary для любимых, error для «не ношу».
export default function ColorPicker({ title, colors, selected, taken = [], tone = 'primary', onToggle, hint }) {
  const labels = colors.filter((c) => selected.includes(c.value)).map((c) => c.label)
  return (
    <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1">{title}</Typography>
        <Typography variant="body2" sx={{ color: selected.length && tone === 'error' ? 'error.main' : 'text.secondary' }}>
          {selected.length} выбрано
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {colors.map((c) => (
          <Swatch
            key={c.value}
            color={c}
            active={selected.includes(c.value)}
            taken={taken.includes(c.value)}
            tone={tone}
            onClick={() => onToggle(c.value)}
          />
        ))}
      </Box>
      {labels.length > 0 && (
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', mt: 1.5 }}>{labels.join(' · ')}</Typography>
      )}
      {hint && <Typography variant="caption" component="p" sx={{ color: 'text.secondary', mt: 1.5 }}>{hint}</Typography>}
    </Box>
  )
}
