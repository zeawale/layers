import { createTheme } from '@mui/material/styles'

// Одно место для цветов и шрифтов. Правим здесь, а не по компонентам.
// Значения взяты из макетов Figma (страница «Дизайн-система»).
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e4636' }, // тёмно-зелёный: главные кнопки, активные элементы
    secondary: { main: '#c96f4a' }, // терракота: акценты
    error: { main: '#b8432f' },
    success: { main: '#3e7a52' },
    background: { default: '#f4f1ea', paper: '#ffffff' },
    text: { primary: '#1c1b18', secondary: '#6f6a60', disabled: '#a39d91' },
    divider: '#e2dcd0',
  },
  shape: { borderRadius: 16 },
  typography: {
    // Manrope — весь интерфейс, Cormorant Garamond — крупные заголовки.
    // Шрифты подключаются в index.html.
    fontFamily: '"Manrope", system-ui, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 40, lineHeight: 1.1 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 32, lineHeight: 1.15 },
    h3: { fontWeight: 700, fontSize: 20 },
    h4: { fontWeight: 600, fontSize: 17 },
    button: { textTransform: 'none', fontWeight: 600 }, // без капслока, как в макетах
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      // Кнопки в макетах — «таблетки» высотой 52 px
      styleOverrides: { root: { borderRadius: 999, minHeight: 52, paddingInline: 24 } },
    },
  },
})

export default theme
