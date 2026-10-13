import { Button } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import BottomBar from '../../components/BottomBar.jsx'

// «Удалить (N)» в режиме выбора (макет 3.10) — в тёмной оболочке на месте нижней панели, она в это время спрятана.
// Пока ничего не отмечено — «Удалить (0)», неактивная: низ экрана не пустеет
export default function DeleteBar({ count, onClick }) {
  return (
    <BottomBar>
      <Button variant="contained" color="error" size="large" fullWidth disabled={count === 0} startIcon={<DeleteOutlineIcon />} onClick={onClick}>
        Удалить ({count})
      </Button>
    </BottomBar>
  )
}
