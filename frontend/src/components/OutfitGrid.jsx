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

// Фото целиком в белой рамке: вещи снимают в разных пропорциях, обрезка съедала низ брюк и обуви.
function Tile({ item, label, sx }) {
  return (
    <ItemPhoto
      src={mediaUrl(item.photo?.url)}
      contain
      sx={{ aspectRatio: 'auto', height: '100%', p: 0.75, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', ...sx }}
    >
      <CategoryPill>{label}</CategoryPill>
    </ItemPhoto>
  )
}

// Плитки комплекта: вещи из items и пустые слоты для missing (макет 2.2). label — подпись категории из справочника.
// Пустой слот — только для категории, которой нет среди вещей: заглушка движка в дождь кладёт
// непромокаемую верхнюю одежду в missing, даже если обычное пальто уже в items
export default function OutfitGrid({ items, missing = [], label }) {
  const present = new Set(items.map((i) => i.category))
  const slots = [
    ...items.map((item) => ({ key: `i${item.id}`, category: item.category, item })),
    ...missing.filter((c) => !present.has(c)).map((c) => ({ key: `m${c}`, category: c })),
  ].sort((a, b) => rank(a.category) - rank(b.category))
  const layout = LAYOUTS[slots.length] ?? MANY
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: layout.columns, gridAutoRows: layout.rows, gridTemplateRows: layout.rows, gap: 1 }}>
      {slots.map((slot, i) => {
        const sx = layout.tall && i === 0 ? { gridRow: 'span 2' } : undefined
        const name = label('category', slot.category)
        return slot.item
          ? <Tile key={slot.key} item={slot.item} label={name} sx={sx} />
          : <MissingSlot key={slot.key} label={name} sx={sx} />
      })}
    </Box>
  )
}
