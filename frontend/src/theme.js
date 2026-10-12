import { alpha, createTheme } from '@mui/material/styles'

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
    // Сплошные светлые заливки кружков с иконкой (80 px) и скелетонов загрузки
    tint: { success: '#dce5dc', secondary: '#f3ded3', neutral: '#ebe6dc' },
    // Золотая «искра» — подбор комплекта и «Почему этот комплект»
    gold: { main: '#d9a441' },
    // Карточка погоды на главном: небо, тёплое пятно солнца и иконки
    weather: { sky: '#dde8f1', sun: '#dbd0b3', icon: '#6f9cc4' },
    // Кружки справочника цветов (GET /attributes, color). Ключи — машинные значения цветов
    swatch: {
      black: '#1c1b18', white: '#ffffff', gray: '#9e9e9e', beige: '#d4c5a9',
      brown: '#6d4c30', navy: '#1a237e', blue: '#1565c0', light_blue: '#64b5f6',
      green: '#388e3c', khaki: '#827717', yellow: '#fdd835', orange: '#ef6c00',
      red: '#c62828', maroon: '#6a1b34', pink: '#e91e90',
      multicolor: 'conic-gradient(red, orange, yellow, green, blue, violet, red)',
      unknown: '#cccccc',
    },
  },
  shape: { borderRadius: 16 },
  // Тень плавающей нижней панели из макетов
  custom: {
    tabBarShadow: '0 16px 40px -6px rgba(28, 27, 24, 0.18)',
    // Мягкая тень белой карточки комплекта
    cardShadow: '0 12px 32px -12px rgba(28, 27, 24, 0.16)',
  },
  typography: {
    // Manrope — весь интерфейс, Cormorant Garamond — крупные заголовки.
    // Шрифты подключаются в index.html.
    fontFamily: '"Manrope", system-ui, sans-serif',
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 40, lineHeight: 1.1 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 32, lineHeight: 1.15 },
    h3: { fontWeight: 700, fontSize: 20 },
    h4: { fontWeight: 600, fontSize: 17 },
    // Заголовок карточки или блока: «Повседневный», «Люблю носить»
    subtitle1: { fontWeight: 600, fontSize: 15, lineHeight: 1.4 },
    // Пояснение под заголовком карточки: «Удобно каждый день», выбранные цвета
    subtitle2: { fontWeight: 400, fontSize: 13, lineHeight: 1.4 },
    // Основной текст и подзаголовки экранов
    body1: { fontSize: 15, lineHeight: 1.5 },
    // Мелкие подсказки под блоками и полями
    caption: { fontSize: 12, lineHeight: 1.4 },
    // Подписи капсом: «Ваша палитра»
    overline: { fontSize: 12, fontWeight: 600, letterSpacing: 1, lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 }, // без капслока, как в макетах
    // Подпись активной вкладки нижней панели
    tab: { fontSize: 13, fontWeight: 600, lineHeight: 1.2 },
    // Крупная температура на карточке погоды
    temperature: { fontSize: 56, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em' },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      // Кнопки в макетах — «таблетки» высотой 52 px
      styleOverrides: { root: { borderRadius: 999, minHeight: 52, paddingInline: 24 } },
      // Второстепенные кнопки в макетах — белые с тонкой рамкой и тёмным текстом
      variants: [
        // Неактивная главная кнопка («Сохраняем…», «Готово» без города) — бледная, но текст читается.
        // Иначе MUI красит её в серый с серым текстом
        {
          props: { variant: 'contained', color: 'primary' },
          style: ({ theme }) => ({
            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette.primary.main, 0.6),
              color: theme.palette.common.white,
            },
          }),
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: ({ theme }) => ({
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
          }),
        },
      ],
    },
    MuiSkeleton: {
      // Скелетоны загрузки в макете (2.4) — бежевые плашки, одинаковые на фоне и на белой карточке
      styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.tint.neutral }) },
    },
    MuiOutlinedInput: {
      // Поля ввода в макетах: белые, сильно скруглённые, с тонкой рамкой
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: theme.shape.borderRadius * 3,
          backgroundColor: theme.palette.background.paper,
        }),
        notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
        // Автозаполнение Chrome и Edge красит поле в голубой, оставляем белым
        input: ({ theme }) => ({
          '&:-webkit-autofill': {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.background.paper} inset`,
            WebkitTextFillColor: theme.palette.text.primary,
          },
        }),
      },
    },
  },
})

export default theme
