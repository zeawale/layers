import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material'
import CalendarMonthOutlined from '@mui/icons-material/CalendarMonthOutlined'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'
import PersonOutline from '@mui/icons-material/PersonOutline'
import WbSunnyOutlined from '@mui/icons-material/WbSunnyOutlined'

// Вкладки нижней панели: порядок и названия — как в макетах.
const TABS = [
  { path: '/today', label: 'Сегодня', icon: <WbSunnyOutlined /> },
  { path: '/wardrobe', label: 'Гардероб', icon: <CheckroomOutlined /> },
  { path: '/history', label: 'История', icon: <CalendarMonthOutlined /> },
  { path: '/profile', label: 'Профиль', icon: <PersonOutline /> },
]

// Общая обёртка для экранов внутри приложения: страница сверху, нижняя панель внизу.
// Вход, регистрация и онбординг рисуются без панели, поэтому в App.jsx они стоят вне этой обёртки.
export default function AppLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Активная вкладка — та, с чего начинается адрес: /wardrobe/5 тоже подсветит «Гардероб».
  // Если адрес не подошёл ни к одной вкладке, ни одна не подсвечивается (false).
  const current = TABS.find((tab) => pathname.startsWith(tab.path))?.path ?? false

  return (
    // Интерфейс только под мобильный экран шириной 390 px, поэтому на большом экране он по центру.
    // Нижний отступ нужен, чтобы панель не закрывала конец страницы.
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', pb: 14 }}>
      <Outlet />

      {/* Плавающая тёмная «таблетка» внизу, как в макетах */}
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
          boxShadow: '0 16px 40px -6px rgba(28, 27, 24, 0.18)',
          zIndex: 10,
        }}
      >
        <BottomNavigation
          value={current}
          onChange={(_, path) => navigate(path)}
          sx={{ bgcolor: 'transparent', height: 52 }}
        >
          {TABS.map((tab) => {
            const active = tab.path === current
            return (
              <BottomNavigationAction
                key={tab.path}
                value={tab.path}
                icon={tab.icon}
                // Подпись видна только у активной вкладки, у остальных — только иконка
                label={active ? tab.label : undefined}
                aria-label={tab.label}
                sx={{
                  flexDirection: 'row',
                  minWidth: 0,
                  borderRadius: 999,
                  color: 'common.white',
                  opacity: 0.62,
                  '& .MuiBottomNavigationAction-label': { ml: active ? 1 : 0, fontSize: 14, fontWeight: 600 },
                  '&.Mui-selected': { color: 'text.primary', bgcolor: 'background.paper', opacity: 1 },
                }}
              />
            )
          })}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
