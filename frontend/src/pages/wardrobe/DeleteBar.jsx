import { Box, Button } from '@mui/material'

// «Удалить (N)» в режиме выбора (макет 3.10) — висит над нижней панелью приложения
export default function DeleteBar({ count, onClick }) {
  return (
    <Box
      sx={{
        position: 'fixed',
        left: '50%',
        transform: 'translateX(-50%)',
        bottom: 100,
        width: 'calc(100% - 48px)',
        maxWidth: 342,
        zIndex: 11,
      }}
    >
      <Button variant="contained" color="error" size="large" fullWidth onClick={onClick}>
        Удалить ({count})
      </Button>
    </Box>
  )
}
