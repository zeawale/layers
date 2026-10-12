import { useEffect, useState } from 'react'

import { listItems } from '../../api/items.js'
import { getHistory } from '../../api/outfit.js'

// Счётчики под шапкой профиля — полей в API нет, считаем сами (HANDBOOK, раздел 8): вещи — из гардероба,
// комплекты и доля «Нравится» — из истории с даты регистрации
export default function useProfileStats(user) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    if (!user) return
    Promise.all([listItems(), getHistory({ from: user.created_at.slice(0, 10) })])
      .then(([wardrobe, history]) => {
        const rated = history.outfits.filter((outfit) => outfit.feedback?.rating)
        const liked = rated.filter((outfit) => outfit.feedback.rating === 'like').length
        setStats({
          items: wardrobe.total,
          outfits: history.total,
          liked: rated.length ? `${Math.round((liked / rated.length) * 100)}%` : '—',
        })
      })
      // Счётчики — не главное на экране: не пришли — просто не показываем
      .catch(() => setStats(null))
  }, [user])
  return stats
}
