import { Box } from '@mui/material'

import { mediaUrl } from '../api/client.js'
import CategoryPill from './CategoryPill.jsx'
import ItemPhoto from './ItemPhoto.jsx'
import MissingSlot from './MissingSlot.jsx'

// Порядок плиток — как в макете 2.13: верхняя одежда первой (крупно слева), обувь последней
const ORDER = ['outerwear', 'top', 'dress', 'accessory', 'bottom', 'footwear']
const rank = (c) => (ORDER.includes(c) ? ORDER.indexOf(c) : ORDER.length)

// Раскладка по числу вещей (макет 2.13). При 3 и 5 первая плитка высокая на две строки,
// левая колонка чуть шире (160 и 150 px на экране 390)
const LAYOUTS = {
  1: { columns: '1fr', rows: '236px' },
  2: { columns: 'repeat(2, minmax(0, 1fr))', rows: '236px' },
  3: { columns: 'minmax(0, 16fr) minmax(0, 15fr)', rows: '114px 114px', tall: true },
  4: { columns: 'repeat(2, minmax(0, 1fr))', rows: '200px 130px' },
  5: { columns: 'minmax(0, 16fr) minmax(0, 15fr)', rows: '114px 114px 118px', tall: true },
}
const MANY = { columns: 'repeat(2, minmax(0, 1fr))', rows: '130px' }

function Tile({ item, label, sx }) {
  return (
    <ItemPhoto src={mediaUrl(item.photo?.url)} sx={{ aspectRatio: 'auto', height: '100%', borderRadius: '16px', bgcolor: 'background.default', ...sx }}>
      <CategoryPill>{label}</CategoryPill>
    </ItemPhoto>
  )
}

// Плитки комплекта: вещи из items и слоты для missing (макет 2.2, API.md «Партнёрские товары»).
// label — подпись категории из справочника. absent — пустой слот или товар партнёра на его месте.
// not_waterproof — куртка есть, но не от дождя: товар рядом отдельным слотом «Под дождь», без товаров — ничего
export default function OutfitGrid({ items, missing = [], label }) {
  const slots = [
    ...items.map((item) => ({ key: `i${item.id}`, category: item.category, item })),
    ...missing
      .filter((m) => m.reason === 'absent' || m.suggestions.length > 0)
      .map((m) => ({ key: `m${m.category}`, category: m.category, missing: m })),
  ].sort((a, b) => rank(a.category) - rank(b.category))
  const layout = LAYOUTS[slots.length] ?? MANY
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: layout.columns, gridAutoRows: layout.rows, gridTemplateRows: layout.rows, gap: 1 }}>
      {slots.map((slot, i) => {
        const sx = layout.tall && i === 0 ? { gridRow: 'span 2' } : undefined
        if (slot.item) return <Tile key={slot.key} item={slot.item} label={label('category', slot.category)} sx={sx} />
        const name = slot.missing.reason === 'not_waterproof' ? 'Под дождь' : label('category', slot.category)
        return <MissingSlot key={slot.key} label={name} suggestions={slot.missing.suggestions} sx={sx} />
      })}
    </Box>
  )
}
