import { Box, Typography } from '@mui/material'

// «2 сентября 2026»
export function formatDate(iso, withYear = true) {
  const opts = withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }
  return new Date(iso).toLocaleDateString('ru-RU', opts).replace(' г.', '')
}

// Список полей вещи на карточке (макет 3.2). label — подпись из справочника (useAttributes)
export default function ItemFacts({ item, label }) {
  const seasons = item.season.map((s, i) => (i ? label('season', s).toLowerCase() : label('season', s)))
  const rows = [
    ['Категория', label('category', item.category)],
    ['Цвет', label('color', item.color)],
    // Пустой список сезонов — вещь всесезонная (API.md, Item)
    ['Сезон', seasons.length ? seasons.join(', ') : 'Всесезонная'],
    // Без стиля вещь подходит под любой
    ['Стиль', item.style ? label('style', item.style) : 'Любой'],
    ['Теплота', `${'●'.repeat(item.warmth)}${'○'.repeat(5 - item.warmth)}  ${label('warmth', item.warmth).toLowerCase()}`],
    ['Защита от осадков', label('water_resistance', item.water_resistance)],
    ['Добавлена', formatDate(item.created_at)],
  ]

  return (
    <Box component="dl" sx={{ bgcolor: 'background.paper', borderRadius: '20px', px: 2, mt: 0, mb: 3 }}>
      {rows.map(([name, value], i) => (
        <Box
          key={name}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            py: 1.5,
            borderBottom: i < rows.length - 1 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Typography component="dt" sx={{ color: 'text.secondary', flexShrink: 0 }}>{name}</Typography>
          <Typography component="dd" variant="subtitle1" sx={{ m: 0, textAlign: 'right', whiteSpace: 'pre-wrap', minWidth: 0 }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
