import { useId } from 'react'
import { Box, InputAdornment, TextField, Typography } from '@mui/material'

// Подпись над полем + поле + ошибка под ним (422 по полю — по-русски, CLAUDE.md «Данные и запросы»).
// icon — иконка слева в поле, end — справа (у выпадающего списка — перед стрелкой), остальные пропсы уходят в TextField.
// Подпись — <label> для поля: по ней поле называет экранная читалка и на неё можно нажать
export default function FormField({ id, label, icon, error, end, slotProps, ...props }) {
  const autoId = useId()
  const fieldId = id ?? autoId
  return (
    <Box>
      <Typography component="label" htmlFor={fieldId} variant="body2" sx={{ display: 'block', color: 'text.secondary', mb: 0.75 }}>
        {label}
      </Typography>
      <TextField
        id={fieldId}
        fullWidth
        error={Boolean(error)}
        helperText={error || undefined}
        {...props}
        slotProps={{
          ...slotProps,
          input: {
            startAdornment: icon && <InputAdornment position="start" sx={{ color: 'text.secondary' }}>{icon}</InputAdornment>,
            endAdornment: end && <InputAdornment position="end" sx={props.select ? { mr: 3 } : undefined}>{end}</InputAdornment>,
            ...slotProps?.input,
          },
        }}
      />
    </Box>
  )
}
