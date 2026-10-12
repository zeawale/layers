import { Box, Typography } from '@mui/material'

import PhotoCard from '../../components/PhotoCard.jsx'

// Описания карточек стилей. Названия и сам список берём из GET /attributes
export const STYLE_DESC = {
  casual: 'Удобно каждый день',
  sport: 'Движение и комфорт',
  business: 'Строго — для работы и учёбы',
}

// Порядок стилей — как в макете: стиль, которого нет в словаре описаний, идёт в конец
const STYLE_ORDER = Object.keys(STYLE_DESC)
const styleRank = (value) => (STYLE_ORDER.includes(value) ? STYLE_ORDER.indexOf(value) : STYLE_ORDER.length)

export const sortStyles = (styles) => [...styles].sort((a, b) => styleRank(a.value) - styleRank(b.value))

// «Какой стиль тебе ближе?» — шаг 1 онбординга и экран 4.4 в профиле
export default function StyleStep({ styles, value, onChange }) {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 1 }}>Какой стиль тебе ближе?</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Выбери стиль, который тебе ближе. Дальше сервис будет учиться на твоих оценках.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, mb: 4 }}>
        {styles.map((s) => (
          <PhotoCard
            key={s.value}
            image={`/onboarding/style-${s.value}.jpg`}
            // Кадр чуть выше центра: на вертикальных фото видна и голова, и образ
            imagePosition="center 25%"
            title={s.label}
            subtitle={STYLE_DESC[s.value]}
            selected={value === s.value}
            onClick={() => onChange(s.value)}
            wrap
          />
        ))}
      </Box>
    </>
  )
}
