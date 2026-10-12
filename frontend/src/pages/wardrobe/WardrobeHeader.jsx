import { Box, Button, IconButton, Typography } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import itemsWord from './itemsWord.js'

// Шапка гардероба: заголовок, «+» (или «Готово» в режиме выбора) и строка под ним.
// total — сколько вещей (null, пока список грузится); selected — id выбранных или null вне режима выбора
export default function WardrobeHeader({ total, selected, max, onAdd, onDone }) {
  const count = selected?.length ?? 0
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="h1">Гардероб</Typography>
        {selected ? (
          <Button onClick={onDone} sx={{ color: 'text.primary' }}>Готово</Button>
        ) : total > 0 && (
          <IconButton
            onClick={onAdd}
            aria-label="Добавить вещь"
            sx={{ bgcolor: 'primary.main', color: 'common.white', width: 44, height: 44, '&:hover': { bgcolor: 'primary.dark' } }}
          >
            <AddIcon />
          </IconButton>
        )}
      </Box>
      {/* Счётчик — только когда список загружен: до этого «Пока ни одной вещи» было бы неправдой */}
      <Typography sx={{ color: 'text.secondary', mb: 3, minHeight: '1.5em' }}>
        {selected && `Выбрано: ${count}${count === max ? ' — больше за раз не удалить' : ''}`}
        {!selected && total !== null && (total ? `${total} ${itemsWord(total)} в гардеробе` : 'Пока ни одной вещи')}
      </Typography>
    </>
  )
}
