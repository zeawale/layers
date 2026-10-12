import { Box, InputAdornment, TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

import PillButton from './PillButton.jsx'

// Поиск по названию и «Выбрать» рядом (макет 3.0), обе высотой 48. onSelect нет — режим выбора уже включён,
// кнопку прячем, поиск на всю ширину (3.10)
export default function SearchRow({ query, onChange, onSelect }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2.25 }}>
      <TextField
        placeholder="Поиск по названию"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        sx={{ '& .MuiOutlinedInput-root': { height: 48, borderRadius: 999 } }}
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
      {onSelect && <PillButton onClick={onSelect}>Выбрать</PillButton>}
    </Box>
  )
}
