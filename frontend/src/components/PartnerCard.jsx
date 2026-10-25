import { useState } from 'react'
import { Box, Link, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'

import { formatPrice } from '../format.js'
import CategoryPill from './CategoryPill.jsx'
import DotButtons from './DotButtons.jsx'
import ItemPhoto from './ItemPhoto.jsx'

// Товар партнёра на месте того, чего не хватило (API.md, «Партнёрские товары»): фото товара, название,
// цена и магазин, «В магазин» и «Реклама». Рамка пунктирная, как у пустого слота: это не вещь из гардероба.
// Предложений несколько — точки внизу листают их; свайп оставлен вариантам комплекта
export default function PartnerCard({ label, suggestions, sx }) {
  const [currentId, setCurrentId] = useState(suggestions[0].id)
  // Пришёл другой набор товаров (новый вариант комплекта) — показываем первый
  const product = suggestions.find((s) => s.id === currentId) ?? suggestions[0]
  const details = [product.price != null && formatPrice(product.price), product.shop].filter(Boolean).join(' · ')
  return (
    <Box
      sx={(t) => ({
        position: 'relative',
        minWidth: 0,
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1.5px dashed ${alpha(t.palette.secondary.main, 0.6)}`,
        bgcolor: 'background.default',
        ...sx,
      })}
    >
      <ItemPhoto src={product.image_url} sx={{ aspectRatio: 'auto', height: '100%', bgcolor: 'background.paper' }} />
      <CategoryPill>{label}</CategoryPill>
      <Box sx={(t) => ({ position: 'absolute', insetInline: 0, bottom: 0, p: 1, bgcolor: alpha(t.palette.background.paper, 0.92) })}>
        <Typography variant="subtitle2" noWrap title={product.name}>{product.name}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" noWrap sx={{ color: 'text.secondary', flexGrow: 1, minWidth: 0 }}>{details}</Typography>
          {suggestions.length > 1 && (
            <DotButtons
              ids={suggestions.map((s) => s.id)}
              currentId={product.id}
              onSelect={setCurrentId}
              itemLabel={(i) => `Товар ${i + 1}`}
              groupLabel="Другие товары"
              size="small"
              sx={{ flexShrink: 0 }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1 }}>
          <Link href={product.url} target="_blank" rel="sponsored noopener noreferrer" variant="body2" sx={{ color: 'primary.main' }}>
            В магазин
          </Link>
          {/* Пометка рекламы — на каждой карточке товара (API.md) */}
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>Реклама</Typography>
        </Box>
      </Box>
    </Box>
  )
}
