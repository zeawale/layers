import { Button } from '@mui/material'
import { keyframes } from '@emotion/react'
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined'

const spin = keyframes`to { transform: rotate(360deg); }`

// «↻ 2 из 3» справа от «Комплект на сегодня» (макеты 2.0, 2.1): нажатие — новый вариант.
// Число — variant выбранного и variants_max (API.md, OutfitDay). Лимит исчерпан — нажатие листает готовые
// по кругу (после 3 — снова 1, решение Саши после теста); неактивна, только если вариант один.
// Пока собирается вариант, стрелки крутятся. locked — комплект отмечен «надет»: кнопка неактивна
export default function VariantButton({ variant, max, canMore, canCycle, busy, locked, onNew, onCycle }) {
  const active = canMore || canCycle
  return (
    <Button
      variant="outlined"
      onClick={canMore ? onNew : onCycle}
      disabled={!active || busy || locked}
      aria-label={locked || !active ? `Вариант ${variant} из ${max}` : `${canMore ? 'Другой' : 'Следующий'} вариант. Сейчас ${variant} из ${max}`}
      aria-busy={busy}
      startIcon={<AutorenewOutlined sx={busy ? { animation: `${spin} 1s linear infinite` } : undefined} />}
      sx={{
        flexShrink: 0,
        minHeight: 38,
        px: 3.25,
        '&.Mui-disabled': { bgcolor: 'transparent', color: 'text.secondary', borderColor: 'outline.main' },
      }}
    >
      {variant} из {max}
    </Button>
  )
}
