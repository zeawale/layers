import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import Toast from './Toast.jsx'

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

  return <Toast text={text} onClose={() => setText(null)} />
}
