import { useEffect, useState } from 'react'

import { listItems } from '../../api/items.js'
import { getHistory } from '../../api/outfit.js'

// Счётчики под шапкой профиля — полей в API нет, считаем сами (HANDBOOK, раздел 8): вещи — из гардероба,
// комплекты и сколько из них с «Нравится» — из истории с даты регистрации.
// Зависим от даты регистрации, а не от объекта user: смена фото кладёт новый user, гардероб и историю заново не грузим
export default function useProfileStats(user) {
  const from = user?.created_at.slice(0, 10)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!from) return
    let alive = true
    setStats(null)
    setError(null)
    Promise.all([listItems(), getHistory({ from })])
      .then(([wardrobe, history]) => {
        if (!alive) return
        setStats({
          items: wardrobe.total,
          outfits: history.total,
          // Без оценок — 0, а не «—»: прочерк читался как ошибка (HANDBOOK, раздел 8)
          liked: history.outfits.filter((outfit) => outfit.feedback?.rating === 'like').length,
        })
      })
      // Истёкшая сессия — уже идёт переход на вход, ошибку не показываем
      .catch((err) => alive && !err.expired && setError(err))
    return () => { alive = false }
  }, [from, attempt])

  return { stats, error, retry: () => setAttempt((n) => n + 1) }
}
