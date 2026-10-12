import { Box, Typography } from '@mui/material'

import { mediaUrl } from '../api/client.js'
import ItemPhoto from './ItemPhoto.jsx'

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

function Tile({ item, label, tall }) {
  return (
    <ItemPhoto
      src={mediaUrl(item.photo?.url)}
      sx={{ aspectRatio: 'auto', height: '100%', borderRadius: '16px', bgcolor: 'background.default', ...(tall && { gridRow: 'span 2' }) }}
    >
      {/* Подпись категории — белая «таблетка» в углу фото */}
      <Typography
        variant="overline"
        sx={{ position: 'absolute', top: 10, left: 10, bgcolor: 'background.paper', color: 'text.secondary', borderRadius: 999, px: 1.25, py: 0.5 }}
      >
        {label}
      </Typography>
    </ItemPhoto>
  )
}

// Плитки комплекта: столько, сколько вещей пришло в items. label — подпись категории из справочника
export default function OutfitGrid({ items, label }) {
  const sorted = [...items].sort((a, b) => rank(a.category) - rank(b.category))
  const layout = LAYOUTS[sorted.length] ?? MANY
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: layout.columns, gridAutoRows: layout.rows, gridTemplateRows: layout.rows, gap: 1 }}>
      {sorted.map((item, i) => (
        <Tile key={item.id} item={item} label={label('category', item.category)} tall={layout.tall && i === 0} />
      ))}
    </Box>
  )
}
