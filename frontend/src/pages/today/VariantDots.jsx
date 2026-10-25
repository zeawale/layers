import { Typography } from '@mui/material'

import DotButtons from '../../components/DotButtons.jsx'

// Точки под плитками — по одной на готовый вариант, выбранная тёмная (решение по #49: точки и свайп).
// Нажатие на точку — вернуться к варианту. Лимит исчерпан — подпись под точками (2.8)
export default function VariantDots({ variants, selectedId, canMore, disabled, onSelect }) {
  return (
    <>
      {variants.length > 1 && (
        <DotButtons
          ids={variants.map((v) => v.id)}
          currentId={selectedId}
          onSelect={onSelect}
          itemLabel={(i) => `Вариант ${variants[i].variant}`}
          groupLabel="Варианты комплекта"
          disabled={disabled}
          sx={{ justifyContent: 'center', mt: 0.5 }}
        />
      )}
      {!canMore && (
        <Typography variant="caption" component="p" align="center" sx={{ color: 'text.secondary', mt: variants.length > 1 ? 0 : 1.5 }}>
          На сегодня вариантов больше нет
        </Typography>
      )}
    </>
  )
}
