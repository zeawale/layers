import { Box, Typography } from '@mui/material'

import ColorLabel from '../../components/ColorLabel.jsx'
import Panel from '../../components/Panel.jsx'
import WarmthDots from '../../components/WarmthDots.jsx'

// «2 сентября 2026»
export function formatDate(iso, withYear = true) {
  const opts = withYear ? { day: 'numeric', month: 'long', year: 'numeric' } : { day: 'numeric', month: 'long' }
  return new Date(iso).toLocaleDateString('ru-RU', opts).replace(' г.', '')
}

// Список полей вещи на карточке (макет 3.2). label — подпись из справочника (useAttributes),
// warmthMax — сколько уровней теплоты в справочнике
export default function ItemFacts({ item, label, warmthMax }) {
  const seasons = item.season.map((s, i) => (i ? label('season', s).toLowerCase() : label('season', s)))
  const rows = [
    ['Категория', label('category', item.category)],
    [
      'Цвет',
      <ColorLabel key="c" value={item.color} label={label('color', item.color)} size={14} />,
    ],
    // Пустой список сезонов — вещь всесезонная (API.md, Item)
    ['Сезон', seasons.length ? seasons.join(', ') : 'Всесезонная'],
    // Без стиля вещь подходит под любой
    ['Стиль', item.style ? label('style', item.style) : 'Любой'],
    [
      'Теплота',
      <Box component="span" key="w" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
        <WarmthDots value={item.warmth} max={warmthMax} />
        {label('warmth', item.warmth).toLowerCase()}
      </Box>,
    ],
    ['Защита от осадков', label('water_resistance', item.water_resistance)],
    ['Добавлена', formatDate(item.created_at)],
  ]

  return (
    <Panel component="dl" radius={20} sx={{ px: 2, py: 0, mt: 0, mb: 3.5 }}>
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
          <Typography component="dd" sx={{ m: 0, textAlign: 'right', minWidth: 0 }}>
            {value}
          </Typography>
        </Box>
      ))}
    </Panel>
  )
}
