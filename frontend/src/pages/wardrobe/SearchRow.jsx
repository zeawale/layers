import { Box, Button, InputAdornment, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

// Поиск по названию и «Выбрать» рядом (макет 3.0). onSelect нет — режим выбора уже включён, кнопку прячем
export default function SearchRow({ query, onChange, onSelect }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <TextField
        placeholder="Поиск по названию"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      {onSelect && <Button onClick={onSelect} sx={{ color: 'text.primary', flexShrink: 0 }}>Выбрать</Button>}
    </Box>
  )
}
