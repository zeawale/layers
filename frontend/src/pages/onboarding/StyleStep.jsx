import { Box, Typography } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'

// Описания карточек стилей. Названия и сам список берём из GET /attributes
export const STYLE_DESC = {
  casual: 'Удобно каждый день',
  sport: 'Движение и комфорт',
  business: 'Строго — для работы и учёбы',
}

// Шаг 1 онбординга — «Какой стиль вам ближе?»
export default function StyleStep({ styles, value, onChange }) {
  return (
    <>
      <Typography variant="h2" sx={{ mb: 1 }}>Какой стиль вам ближе?</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>
        Выберите стиль, который вам ближе. Дальше сервис будет учиться на ваших оценках.
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, mb: 4 }}>
        {styles.map((s) => {
          const active = value === s.value
          return (
            <Box
              key={s.value}
              onClick={() => onChange(s.value)}
              sx={{
                borderRadius: '20px',
                border: '2px solid',
                borderColor: active ? 'text.primary' : 'divider',
                bgcolor: 'background.paper',
                p: 1,
                cursor: 'pointer',
                height: 'fit-content',
              }}
            >
              <Box sx={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '12px', bgcolor: 'divider', overflow: 'hidden', mb: 1 }}>
                <Box
                  component="img"
                  src={`/onboarding/style-${s.value}.jpg`}
                  alt=""
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  // Кадр чуть выше центра: на вертикальных фото видна и голова, и образ
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', display: 'block' }}
                />
                {active && (
                  <Box
                    sx={{
                      position: 'absolute', top: 8, right: 8,
                      width: 26, height: 26, borderRadius: '50%',
                      bgcolor: 'text.primary', color: 'common.white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CheckIcon fontSize="inherit" />
                  </Box>
                )}
              </Box>
              <Box sx={{ px: 0.5, pb: 0.5 }}>
                <Typography variant="subtitle1" sx={{ mb: 0.25 }}>{s.label}</Typography>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>{STYLE_DESC[s.value]}</Typography>
              </Box>
            </Box>
          )
        })}
      </Box>
    </>
  )
}
