import { createTheme } from '@mui/material/styles'

// Одно место для цветов и шрифтов. Правим здесь, а не по компонентам.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2f3542' },
    secondary: { main: '#c98b6b' },
    background: { default: '#faf7f4' },
  },
  shape: { borderRadius: 12 },
})

export default theme
