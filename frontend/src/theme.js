import { alpha, createTheme } from '@mui/material/styles'
import KeyboardArrowDownRounded from '@mui/icons-material/KeyboardArrowDownRounded'

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
    // Рамка контурных кнопок-«таблеток» — темнее разделителя (макеты 1.2.2, 2.0, 3.2)
    outline: { main: '#cfc7b8' },
    // Сплошные светлые заливки кружков с иконкой (80 px) и скелетонов загрузки
    tint: { success: '#dce5dc', secondary: '#f3ded3', neutral: '#ebe6dc', gold: '#f6e9cc' },
    // Золотая «искра» — подбор комплекта и «Почему этот комплект»
    // dark — значок и текст на золотистой заливке: «Заполнили автоматически», «авто» (3.6)
    gold: { main: '#d9a441', dark: '#9a6f16' },
    // Карточка погоды на главном: небо, тёплое пятно солнца, холодное пятно дождя (2.2) и иконки
    weather: { sky: '#dde8f1', sun: '#dbd0b3', rain: '#c0ccd4', icon: '#6f9cc4' },
    // Кружки справочника цветов (GET /attributes, color). Ключи — машинные значения цветов
    // Значения сняты с макета 1.5 — приглушённые, в тон интерфейсу
    swatch: {
      black: '#1c1b18', white: '#ffffff', gray: '#9a9a95', beige: '#d8c3a5',
      brown: '#7a5230', navy: '#2b3a55', blue: '#3f6fb5', light_blue: '#a9c1d9',
      green: '#4f7a4a', khaki: '#6f7f5f', yellow: '#e3b93c', orange: '#c96f4a',
      red: '#b8432f', maroon: '#7a2e35', pink: '#e8b4b8',
      multicolor: 'linear-gradient(135deg, #c96f4a, #e3b93c 50%, #3f6fb5)',
      unknown: '#cccccc',
    },
  },
  shape: { borderRadius: 16 },
  // Тень плавающей нижней панели из макетов
  custom: {
    tabBarShadow: '0 16px 40px -6px rgba(28, 27, 24, 0.18)',
    // Тень круглой кнопки «+» в шапке гардероба (3.0)
    fabShadow: '0 8px 20px -6px rgba(46, 70, 54, 0.45)',
    // Мягкая тень белой карточки комплекта
    cardShadow: '0 12px 32px -12px rgba(28, 27, 24, 0.16)',
  },
  typography: {
    // Manrope — весь интерфейс, Cormorant Garamond — крупные заголовки.
    // Шрифты подключаются в index.html.
    fontFamily: '"Manrope", system-ui, sans-serif',
    // h1 — заголовки входа и приветствия (44 px, 1.1–1.3); заголовки вкладок «Гардероб», «История» — h2 (32 px)
    h1: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 44, lineHeight: 1.1 },
    h2: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 32, lineHeight: 1.15 },
    h3: { fontWeight: 700, fontSize: 20 },
    h4: { fontWeight: 600, fontSize: 17 },
    // Заголовок карточки или блока: «Повседневный», «Люблю носить»
    subtitle1: { fontWeight: 600, fontSize: 15, lineHeight: 1.4 },
    // Пояснение под заголовком карточки: «Удобно каждый день», выбранные цвета
    subtitle2: { fontWeight: 400, fontSize: 13, lineHeight: 1.4 },
    // Основной текст и подзаголовки экранов — 16 px (ширина строк в макетах 1.2, 1.3, 3.1 совпадает с Manrope 16).
    // Текст внутри карточек («Почему этот комплект», 2.9) — body2, 14 px
    body1: { fontSize: 16, lineHeight: 1.5 },
    // Мелкие подсказки под блоками и полями
    caption: { fontSize: 12, lineHeight: 1.4 },
    // Подписи капсом: «Твоя палитра»
    overline: { fontSize: 12, fontWeight: 600, letterSpacing: 1, lineHeight: 1.4 },
    button: { textTransform: 'none', fontWeight: 600 }, // без капслока, как в макетах
    // Подпись активной вкладки нижней панели
    tab: { fontSize: 13, fontWeight: 600, lineHeight: 1.2 },
    // Логотип «layers» на заставке (1.0) и подпись под ним курсивом
    logo: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontSize: 48, lineHeight: 1 },
    tagline: { fontFamily: '"Cormorant Garamond", serif', fontWeight: 500, fontStyle: 'italic', fontSize: 22, lineHeight: 1.3 },
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
        // Неактивная главная кнопка («Сохраняем…», «Готово» без города, «Удалить (0)» в 3.10) — бледная,
        // но текст читается. Иначе MUI красит её в серый с серым текстом
        ...['primary', 'error'].map((color) => ({
          props: { variant: 'contained', color },
          style: ({ theme }) => ({
            '&.Mui-disabled': {
              backgroundColor: alpha(theme.palette[color].main, 0.6),
              color: theme.palette.common.white,
            },
          }),
        })),
        {
          props: { variant: 'outlined', color: 'primary' },
          style: ({ theme }) => ({
            borderColor: theme.palette.outline.main,
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
          }),
        },
      ],
    },
    MuiLink: {
      // Ссылки в макетах без подчёркивания — оно появляется только при наведении
      defaultProps: { underline: 'hover' },
    },
    MuiSkeleton: {
      // Скелетоны загрузки в макете (2.4) — бежевые плашки, одинаковые на фоне и на белой карточке
      styleOverrides: { root: ({ theme }) => ({ backgroundColor: theme.palette.tint.neutral }) },
    },
    MuiSnackbarContent: {
      // Уведомления в макетах — тёмная плашка со скруглением: «Сессия истекла», «Вещь добавлена»
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.text.primary,
          color: theme.palette.background.paper,
          borderRadius: theme.shape.borderRadius,
          ...theme.typography.subtitle1,
        }),
      },
    },
    MuiSelect: {
      // Стрелка выпадающего списка — «шеврон», как в макетах 3.6 и 3.9
      defaultProps: { IconComponent: KeyboardArrowDownRounded },
      styleOverrides: { icon: ({ theme }) => ({ color: theme.palette.text.secondary, right: 14 }) },
    },
    MuiOutlinedInput: {
      // Поля ввода в макетах: белые, высота 52, скругление 14, тонкая рамка (1.2, 3.6)
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 14,
          backgroundColor: theme.palette.background.paper,
        }),
        notchedOutline: ({ theme }) => ({ borderColor: theme.palette.divider }),
        // Автозаполнение Chrome и Edge красит поле в голубой, оставляем белым
        input: ({ theme }) => ({
          paddingTop: 14.5,
          paddingBottom: 14.5,
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
