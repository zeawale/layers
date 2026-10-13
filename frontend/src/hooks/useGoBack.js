import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'

// «Назад» на экране — шаг назад по истории, а не переход вперёд: иначе в истории копятся дубли,
// и системная «назад» снова открывает уже пройденный экран.
// Открыли экран по прямой ссылке или подменой записи (редирект, выход из аккаунта) — позади не тот экран,
// откуда пришли по кнопке: тогда на fallback, тоже подменой
export default function useGoBack(fallback) {
  const navigate = useNavigate()
  const { key } = useLocation()
  const type = useNavigationType()
  return () => {
    if (key === 'default' || type === 'REPLACE') navigate(fallback, { replace: true })
    else navigate(-1)
  }
}
