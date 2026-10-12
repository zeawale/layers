import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Alert, Snackbar } from '@mui/material'

// Уведомление после действия на прошлом экране: navigate(путь, { state: { notice: 'текст' } }).
// Запоминаем текст и сразу убираем из истории: иначе при обновлении страницы оно появится снова
export default function Notice() {
  const location = useLocation()
  const navigate = useNavigate()
  const [text, setText] = useState(location.state?.notice ?? null)

  useEffect(() => {
    if (location.state?.notice) {
      setText(location.state.notice)
      navigate('.', { replace: true, state: null })
    }
  }, [location.state, navigate])

  return (
    <Snackbar
      open={Boolean(text)}
      autoHideDuration={3000}
      onClose={() => setText(null)}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert severity="success" variant="filled" sx={{ overflowWrap: 'anywhere' }}>{text}</Alert>
    </Snackbar>
  )
}
