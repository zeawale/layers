import { Box } from '@mui/material'

import { mediaUrl } from '../../api/client.js'
import ItemTile from './ItemTile.jsx'

// Сетка вещей в две колонки (макеты 3.0, 3.10). minmax(0, 1fr): длинное название не раздвигает колонку шире экрана.
// selected — id выбранных или null вне режима выбора; в режиме выбора снизу место под «Удалить (N)»
export default function ItemGrid({ items, label, selected, onOpen, onToggle }) {
  const selecting = selected !== null
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.5, rowGap: 2, pb: selected?.length ? 9 : 2 }}>
      {items.map((item) => (
        <ItemTile
          key={item.id}
          image={mediaUrl(item.photo?.url)}
          title={item.name}
          subtitle={`${label('category', item.category)} · ${label('color', item.color).toLowerCase()}`}
          selecting={selecting}
          selected={selecting && selected.includes(item.id)}
          onClick={() => (selecting ? onToggle(item.id) : onOpen(item.id))}
        />
      ))}
    </Box>
  )
}
