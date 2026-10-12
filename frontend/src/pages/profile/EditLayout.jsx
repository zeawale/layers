import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Box } from '@mui/material'

import { getToken } from '../../api/client.js'
import { getMe, updateMe } from '../../api/users.js'
import BackButton from '../../components/BackButton.jsx'
import { LoadError, Loading } from '../../components/LoadState.jsx'

// Обёртка экранов правки профиля (4.3–4.7): без нижней панели, со стрелкой «назад».
// Грузит профиль один раз и отдаёт экрану через useOutletContext: { user, save, leave }
export default function EditLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const signedIn = Boolean(getToken())

  useEffect(() => {
    if (!signedIn) return
    setError('')
    getMe().then(setUser).catch((err) => setError(err.message))
  }, [signedIn, attempt])

  // Назад — туда, откуда пришли (профиль или главный экран после «Укажи город»).
  // Открыли экран по прямой ссылке — истории нет, тогда в профиль
  function leave() {
    if (location.key === 'default') navigate('/profile', { replace: true })
    else navigate(-1)
  }

  // preferences бэк заменяет целиком, поэтому экраны присылают объект полностью
  async function save(changes) {
    setUser(await updateMe(changes))
    leave()
  }

  if (!signedIn) return <Navigate to="/login" replace />

  return (
    <Box sx={{ maxWidth: 390, mx: 'auto', minHeight: '100vh', px: 3, pt: 2.5, pb: 4 }}>
      <BackButton onClick={leave} sx={{ mb: 2.75 }} />

      {error && <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />}
      {!error && !user && <Loading />}
      {user && <Outlet context={{ user, save, leave }} />}
    </Box>
  )
}
