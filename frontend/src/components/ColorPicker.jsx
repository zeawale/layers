import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import CheckIcon from '@mui/icons-material/Check'

import Panel from './Panel.jsx'

// Кружок цвета справочника 38 px (макет 1.5). Цвет — из theme.palette.swatch по машинному значению.
// Выбранный — тёмное кольцо через белый зазор и галочка; занятый в другом списке — бледный, нажать нельзя
function Swatch({ color, active, taken, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={taken ? undefined : onClick}
      disabled={taken}
      aria-pressed={active}
      aria-label={taken ? `${color.label} — уже в другом списке` : color.label}
      title={taken ? `${color.label} — уже в другом списке` : color.label}
      sx={(t) => {
        const fill = t.palette.swatch[color.value] ?? t.palette.swatch.unknown
        return {
          width: 38,
          height: 38,
          p: 0,
          borderRadius: '50%',
          position: 'relative',
          overflow: 'hidden',
          cursor: taken ? 'default' : 'pointer',
          background: fill,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...(active && {
            border: 0,
            boxShadow: `inset 0 0 0 3px ${t.palette.background.paper}`,
            outline: '2px solid',
            outlineColor: t.palette.text.primary,
            outlineOffset: 1,
          }),
          // Занятый цвет — тот же, но бледный: белая вуаль на три четверти
          ...(taken && {
            '&::before': { content: '""', position: 'absolute', inset: 0, bgcolor: alpha(t.palette.background.paper, 0.75) },
          }),
          // Галочка контрастная к цвету кружка; у разноцветного фона — белая
          '& svg': { width: 18, height: 18, color: fill.startsWith('#') ? t.palette.getContrastText(fill) : t.palette.common.white },
        }
      }}
    >
      {active && <CheckIcon />}
    </Box>
  )
}

// Блок выбора цветов — «Люблю носить» и «Не ношу» в онбординге и профиле (макеты 1.5, 4.5).
// taken — цвета из соседнего списка: один цвет не может быть в обоих (API.md, User.preferences).
// tone — цвет счётчика выбранных: primary для любимых, secondary для «не ношу»
export default function ColorPicker({ title, colors, selected, taken = [], tone = 'primary', onToggle, hint }) {
  const labels = colors.filter((c) => selected.includes(c.value)).map((c) => c.label)
  return (
    <Panel radius={20} sx={{ py: 2.25, px: 2.625, mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2 }}>
        <Typography variant="h4" component="h2">{title}</Typography>
        <Typography variant="body2" sx={{ color: selected.length ? `${tone}.main` : 'text.secondary' }}>
          {selected.length} выбрано
        </Typography>
      </Box>
      {/* Столбцы сжимаются, а промежутки делят остаток: на 375 px шестой кружок не вылезает за карточку */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 38px))', justifyContent: 'space-between', rowGap: 1.5 }}>
        {colors.map((c) => (
          <Swatch
            key={c.value}
            color={c}
            active={selected.includes(c.value)}
            taken={taken.includes(c.value)}
            onClick={() => onToggle(c.value)}
          />
        ))}
      </Box>
      {labels.length > 0 && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>{labels.join(' · ')}</Typography>
      )}
      {hint && <Typography variant="caption" component="p" sx={{ color: 'text.disabled', mt: 1.5 }}>{hint}</Typography>}
    </Panel>
  )
}
