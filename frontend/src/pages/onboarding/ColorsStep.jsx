import { Box, Typography } from '@mui/material'

import ColorPicker from '../../components/ColorPicker.jsx'

const toggle = (list, value) => (list.includes(value) ? list.filter((c) => c !== value) : [...list, value])

// «Цвета, которые вы любите» — шаг 2 онбординга и экран 4.5 в профиле
export default function ColorsStep({ colors, liked, disliked, onChange }) {
  const likedColors = colors.filter((c) => liked.includes(c.value))
  return (
    <>
      <Typography variant="h2" sx={{ mb: 1 }}>Цвета, которые вы любите</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Любимые цвета чаще попадут в комплекты, а нелюбимые — не попадут совсем.
      </Typography>

      <ColorPicker
        title="Люблю носить"
        colors={colors}
        selected={liked}
        taken={disliked}
        onToggle={(c) => onChange({ liked: toggle(liked, c), disliked })}
      />
      <ColorPicker
        title="Не ношу"
        colors={colors}
        selected={disliked}
        taken={liked}
        tone="error"
        onToggle={(c) => onChange({ liked, disliked: toggle(disliked, c) })}
        hint="Цвета из «Люблю носить» здесь недоступны — и наоборот"
      />

      {likedColors.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="overline" component="p" sx={{ color: 'text.secondary', mb: 1 }}>Ваша палитра</Typography>
          <Box sx={{ display: 'flex', borderRadius: 3, overflow: 'hidden', height: 48 }}>
            {likedColors.map((c) => (
              <Box key={c.value} sx={(t) => ({ flex: 1, background: t.palette.swatch[c.value] ?? t.palette.swatch.unknown })} />
            ))}
          </Box>
        </Box>
      )}
    </>
  )
}
