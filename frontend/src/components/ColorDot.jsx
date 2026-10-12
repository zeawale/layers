import { Box } from '@mui/material'

// Неподвижный кружок цвета справочника — показать, какие цвета выбраны. Выбор цветов — ColorPicker
export default function ColorDot({ value, label, size = 28 }) {
  return (
    <Box
      title={label}
      sx={(t) => ({
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        background: t.palette.swatch[value] ?? t.palette.swatch.unknown,
        border: '1px solid',
        borderColor: 'divider',
      })}
    />
  )
}
