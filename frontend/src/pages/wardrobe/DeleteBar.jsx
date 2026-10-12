import { Box, Button } from '@mui/material'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// «Удалить (N)» в режиме выбора (макет 3.10) — на месте нижней панели, она в это время спрятана
export default function DeleteBar({ count, onClick }) {
  return (
    <Box sx={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 24, width: 'calc(100% - 48px)', maxWidth: 342, zIndex: 11 }}>
      <Button variant="contained" color="error" size="large" fullWidth startIcon={<DeleteOutlineIcon />} onClick={onClick}>
        Удалить ({count})
      </Button>
    </Box>
  )
}
