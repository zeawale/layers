import { Box, InputAdornment, TextField, Typography } from '@mui/material'

// Подпись над полем + поле + ошибка под ним (422 по полю — по-русски, CLAUDE.md «Данные и запросы»).
// icon — иконка слева в поле, остальные пропсы уходят в TextField.
export default function FormField({ label, icon, error, end, slotProps, ...props }) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <TextField
        fullWidth
        error={Boolean(error)}
        helperText={error || undefined}
        {...props}
        slotProps={{
          ...slotProps,
          input: {
            startAdornment: icon && <InputAdornment position="start" sx={{ color: 'text.secondary' }}>{icon}</InputAdornment>,
            endAdornment: end && <InputAdornment position="end">{end}</InputAdornment>,
            ...slotProps?.input,
          },
        }}
      />
    </Box>
  )
}
