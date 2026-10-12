import { useState } from 'react'
import FavoriteIcon from '@mui/icons-material/Favorite'
import ThumbDownIcon from '@mui/icons-material/ThumbDown'

import { sendFeedback } from '../api/outfit.js'

// Оценка и «надет» — главный экран (2.3) и прошлый день в истории (4.1a). Ответ — один Outfit:
// onUpdated(outfit) подменяет его у себя, экран не перезагружаем. notify — уведомление: «Спасибо за оценку!» или ошибка бэка
export default function useFeedback(onUpdated, notify) {
  const [busy, setBusy] = useState(false)

  async function send(outfit, changes) {
    setBusy(true)
    try {
      onUpdated(await sendFeedback(outfit.id, changes))
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
