import { Paper } from '@mui/material'

// Плавающая тёмная «таблетка» внизу экрана, как в макетах: 358 px, 22 от низа, внутри отступ 8.
// В ней вкладки (AppLayout) или «Удалить (N)» в режиме выбора гардероба (3.10)
export default function BottomBar({ children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 22,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)',
        maxWidth: 358,
        p: 1,
        borderRadius: 999,
        bgcolor: 'text.primary',
        boxShadow: (t) => t.custom.tabBarShadow,
        zIndex: 10,
      }}
    >
      {children}
    </Paper>
  )
}
