import { Box, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { plural } from '../../format.js'
import PillButton from './PillButton.jsx'

// Шапка гардероба (3.0, 3.1, 3.10): заголовок, «+» (или «Готово» в режиме выбора) и строка под ним.
// total — сколько вещей (null, пока список грузится); selected — id выбранных или null вне режима выбора
export default function WardrobeHeader({ total, selected, max, onAdd, onDone }) {
  const count = selected?.length ?? 0
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.75 }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h2" component="h1">Гардероб</Typography>
        {/* Счётчик — только когда список загружен: до этого «Пока ни одной вещи» было бы неправдой */}
        <Typography variant="body2" sx={{ color: 'text.secondary', minHeight: '1.43em' }}>
          {selected && `Выбрано: ${count}${count === max ? ' — больше за раз не удалить' : ''}`}
          {!selected && total !== null && (total ? `${total} ${plural(total, ['вещь', 'вещи', 'вещей'])} в гардеробе` : 'Пока ни одной вещи')}
        </Typography>
      </Box>
      {selected ? (
        <PillButton onClick={onDone}>Готово</PillButton>
      ) : (
        <IconButton
          onClick={onAdd}
          aria-label="Добавить вещь"
          sx={{ flexShrink: 0, width: 48, height: 48, bgcolor: 'primary.main', color: 'common.white', boxShadow: (t) => t.custom.fabShadow, '&:hover': { bgcolor: 'primary.dark' } }}
        >
          <AddIcon />
        </IconButton>
      )}
    </Box>
  )
}
