import { Box, Typography } from '@mui/material'

import BackButton from '../../components/BackButton.jsx'

// Шапка онбординга: «назад», «Шаг N из 3», «Пропустить» и полоски прогресса.
// На первом шаге «назад» нет: аккаунт уже создан, возвращаться некуда. Нет onBack — тоже нет.
// Кнопку прячем, а не убираем, чтобы «Шаг 1 из 3» не съезжал.
export default function StepHeader({ step, total, onBack, onSkip }) {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.25 }}>
        <BackButton onClick={onBack} sx={{ visibility: step === 0 || !onBack ? 'hidden' : 'visible' }} />
        <Typography variant="body2" sx={{ flex: 1, textAlign: 'center', color: 'text.secondary' }}>
          Шаг {step + 1} из {total}
        </Typography>
        {onSkip ? (
          <Typography variant="body2" onClick={onSkip} sx={{ cursor: 'pointer', color: 'text.secondary', minWidth: 80, textAlign: 'right' }}>
            Пропустить
          </Typography>
        ) : (
          <Box sx={{ minWidth: 80 }} />
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, mb: 3 }}>
        {Array.from({ length: total }, (_, i) => (
          <Box key={i} sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: i <= step ? 'primary.main' : 'divider' }} />
        ))}
      </Box>
    </>
  )
}
