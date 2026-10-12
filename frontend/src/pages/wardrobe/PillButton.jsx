import { Button } from '@mui/material'

// Белая «таблетка» высотой 48 с тонкой рамкой — «Выбрать» и «Готово» (макеты 3.0, 3.10), под стать полю поиска
export default function PillButton({ children, onClick }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      sx={{ flexShrink: 0, minHeight: 48, px: 2, borderColor: 'divider', '&:hover': { borderColor: 'outline.main' } }}
    >
      {children}
    </Button>
  )
}
