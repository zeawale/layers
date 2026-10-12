import { useState } from 'react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'

import { sendFeedback } from '../../api/outfit.js'

// Оценка и «надет» для комплекта дня (макет 2.3). Ответ — один Outfit: подменяем его внутри OutfitDay,
// экран не перезагружаем. notify — уведомление экрана: «Спасибо за оценку!» или ошибка бэка
export default function useFeedback(setDay, notify) {
  const [busy, setBusy] = useState(false)

  async function send(outfit, changes) {
    setBusy(true)
    try {
      const updated = await sendFeedback(outfit.id, changes)
      setDay((d) => ({ ...d, variants: d.variants.map((v) => (v.id === updated.id ? updated : v)) }))
      // Благодарим за поставленную оценку, а не за снятую
      if (changes.rating) {
        notify({
          text: 'Спасибо за оценку!',
          hint: 'Учтём это в следующих подборах',
          icon: changes.rating === 'like' ? <FavoriteIcon /> : <ThumbDownIcon />,
        })
      }
    } catch (err) {
      notify({ text: err.message })
    } finally {
      setBusy(false)
    }
  }

  return {
    busy,
    // Повторное нажатие на ту же оценку снимает её (rating: null)
    rate: (outfit, rating) => send(outfit, { rating: outfit.feedback?.rating === rating ? null : rating }),
    toggleWorn: (outfit) => send(outfit, { worn: !outfit.feedback?.worn }),
  }
}
