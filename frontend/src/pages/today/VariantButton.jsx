import { Button } from '@mui/material'
import { keyframes } from '@emotion/react'
import AutorenewOutlined from '@mui/icons-material/AutorenewOutlined'

const spin = keyframes`to { transform: rotate(360deg); }`

// «↻ 2 из 3» справа от «Комплект на сегодня» (макеты 2.0, 2.1): нажатие — новый вариант.
// Число — variant выбранного и variants_max (API.md, OutfitDay). Лимит исчерпан — кнопка как на 2.8:
// без белой заливки, серый текст, неактивна. Пока собирается вариант, стрелки крутятся
export default function VariantButton({ variant, max, canMore, busy, onClick }) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      disabled={!canMore || busy}
      aria-label={canMore ? `Другой вариант. Сейчас ${variant} из ${max}` : `Вариант ${variant} из ${max}`}
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
