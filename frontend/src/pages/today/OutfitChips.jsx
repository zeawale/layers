import { Box, Typography } from '@mui/material'
import DeviceThermostatOutlined from '@mui/icons-material/DeviceThermostatOutlined'
import LayersOutlined from '@mui/icons-material/LayersOutlined'

import { plural } from '../../format.js'

function Chip({ icon: Icon, children }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, height: 30, px: 1.5, borderRadius: 999, bgcolor: 'background.default', color: 'text.secondary' }}>
      {Icon && <Icon sx={{ width: 16, height: 16 }} />}
      {children}
    </Box>
  )
}

// Чипы под сеткой (макет 2.0): сколько вещей, палитра комплекта, теплота.
// Всё считаем из items: палитра — цвета вещей без повторов, теплота — средняя по вещам, подпись из справочника
export default function OutfitChips({ items, label, sx }) {
  const colors = [...new Set(items.map((i) => i.color))]
  const warmth = Math.round(items.reduce((sum, i) => sum + i.warmth, 0) / items.length)
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, ...sx }}>
      <Chip icon={LayersOutlined}>
        <Typography variant="subtitle2">{items.length} {plural(items.length, ['вещь', 'вещи', 'вещей'])}</Typography>
      </Chip>
      <Chip>
        <Box sx={{ display: 'flex' }} aria-label={`Цвета: ${colors.map((c) => label('color', c).toLowerCase()).join(', ')}`}>
          {colors.map((c, i) => (
            <Box
              key={c}
              title={label('color', c)}
              sx={(t) => ({
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: t.palette.swatch[c] ?? t.palette.swatch.unknown,
                border: `1.5px solid ${t.palette.background.default}`,
                ml: i ? '-3px' : 0,
              })}
            />
          ))}
        </Box>
      </Chip>
      <Chip icon={DeviceThermostatOutlined}>
        <Typography variant="subtitle2">{label('warmth', warmth).toLowerCase()}</Typography>
      </Chip>
    </Box>
  )
}
