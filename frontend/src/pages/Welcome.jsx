import { Navigate, Link as RouterLink, useNavigate } from 'react-router-dom'
import { Box, Button, Link, Typography } from '@mui/material'

import { getToken } from '../api/client.js'

// Макет 1.1 «Приветствие» — первый экран без входа. Коллаж с подписями погоды — картинка из макета.
// Точки карусели в макете не повторяем: слайд пока один, точки обещали бы листание
export default function Welcome() {
  const navigate = useNavigate()
  // Уже вошли — приветствие не нужно
  if (getToken()) return <Navigate to="/" replace />

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <Typography variant="h2" component="p" sx={{ mb: 1.5 }}>layers</Typography>
      {/* aspectRatio держит место под коллаж, пока он грузится, — текст ниже не прыгает */}
      <Box component="img" src="/welcome/hero.png" alt="" sx={{ display: 'block', width: 360, maxWidth: 'calc(100% + 18px)', height: 'auto', aspectRatio: '360 / 280', ml: '-4px', mb: 3.5 }} />
      {/* Перенос строк как в макете: «Что надеть / сегодня — решим / вместе» */}
      <Typography variant="h1" sx={{ mb: 1.75, maxWidth: 330 }}>Что надеть сегодня — решим вместе</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 4 }}>
        Добавь вещи в цифровой гардероб — каждое утро мы соберём комплект под погоду и твой стиль и объясним, почему именно он.
      </Typography>
      <Button variant="contained" size="large" fullWidth onClick={() => navigate('/register')} sx={{ mb: 3 }}>Начать</Button>
      <Typography align="center">
        <Link component={RouterLink} to="/login" variant="subtitle1" sx={{ color: 'text.primary' }}>
          У меня уже есть аккаунт
        </Link>
      </Typography>
    </Box>
  )
}
