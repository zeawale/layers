import { Box, Typography } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import { mediaUrl } from '../../api/client.js'

// Порядок слотов — как в макете: сверху вниз от верхней одежды к обуви
const ORDER = ['outerwear', 'top', 'dress', 'accessory', 'bottom', 'footwear']
const rank = (c) => (ORDER.indexOf(c) === -1 ? ORDER.length : ORDER.indexOf(c))

function Slot({ category, item, missing }) {
  const photo = mediaUrl(item?.photo?.url)
  return (
    <Box
      sx={{
        borderRadius: '16px',
        bgcolor: missing ? 'transparent' : 'background.paper',
        border: missing ? '1px dashed' : '1px solid',
        borderColor: 'divider',
        p: 1,
      }}
    >
      <Box
        sx={{
          aspectRatio: '1 / 1',
          borderRadius: '12px',
          bgcolor: 'background.default',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.disabled',
          mb: 1,
        }}
      >
        {photo ? (
          <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : missing ? (
          <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 11, letterSpacing: 0.5, textAlign: 'center', px: 1 }}>
            НЕТ В ГАРДЕРОБЕ
          </Typography>
        ) : (
          <CheckroomOutlined sx={{ fontSize: 36 }} />
        )}
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 12 }}>{category}</Typography>
      {item && <Typography sx={{ fontWeight: 600, fontSize: 14 }} noWrap>{item.name}</Typography>}
    </Box>
  )
}

// Сетка комплекта — макет 2.13: столько карточек, сколько вещей пришло, плюс пустые слоты для missing.
// Партнёрские товары в пустом слоте — этап 7 (HANDBOOK, раздел 8).
export default function OutfitGrid({ outfit, label }) {
  // Пустой слот — только для категории, где вещи нет: заглушка движка иногда кладёт
  // категорию и в items, и в missing (пальто без защиты от дождя)
  const present = new Set(outfit.items.map((i) => i.category))
  const slots = [
    ...outfit.items.map((item) => ({ key: `i${item.id}`, category: item.category, item })),
    ...outfit.missing.filter((c) => !present.has(c)).map((c) => ({ key: `m${c}`, category: c, missing: true })),
  ].sort((a, b) => rank(a.category) - rank(b.category))

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      {slots.map((s) => (
        <Slot key={s.key} category={label('category', s.category)} item={s.item} missing={s.missing} />
      ))}
    </Box>
  )
}
