import { Typography } from '@mui/material'

// Лицензии Open-Meteo и OpenStreetMap требуют подписи источника (API.md, «Подписи источников данных»)
export default function SourcesNote({ sx }) {
  return (
    <Typography variant="caption" component="p" align="center" sx={{ color: 'text.disabled', ...sx }}>
      Погода и поиск городов: Open-Meteo.com. Город по координатам: © OpenStreetMap
    </Typography>
  )
}
