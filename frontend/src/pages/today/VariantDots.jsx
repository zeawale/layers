import { Box, ButtonBase, Typography } from '@mui/material'

// Точки под плитками — по одной на готовый вариант, выбранная тёмная (решение по #49: точки и свайп).
// Нажатие на точку — вернуться к варианту. Лимит исчерпан — подпись под точками (2.8)
export default function VariantDots({ variants, selectedId, canMore, disabled, onSelect }) {
  return (
    <>
      {variants.length > 1 && (
        <Box role="group" aria-label="Варианты комплекта" sx={{ display: 'flex', justifyContent: 'center', mt: 0.5 }}>
          {variants.map((v) => {
            const current = v.id === selectedId
            return (
              <ButtonBase
                key={v.id}
                onClick={() => onSelect(v.id)}
                disabled={disabled}
                aria-label={`Вариант ${v.variant}`}
                aria-current={current ? 'true' : undefined}
                sx={{ width: 24, height: 24, borderRadius: '50%' }}
              >
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: current ? 'text.primary' : 'outline.main' }} />
              </ButtonBase>
            )
          })}
        </Box>
      )}
      {!canMore && (
        <Typography variant="caption" component="p" align="center" sx={{ color: 'text.secondary', mt: variants.length > 1 ? 0 : 1.5 }}>
          На сегодня вариантов больше нет
        </Typography>
      )}
    </>
  )
}
