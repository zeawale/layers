import { useRef, useState } from 'react'

import { getToday, regenerate, selectVariant } from '../../api/outfit.js'

// Варианты комплекта на сегодня (макеты 2.0, 2.1, 2.8): «Другой вариант» и переключение между готовыми.
// Каждый ответ бэка — OutfitDay целиком, экран перерисовывается из него
export default function useVariants(day, setDay) {
  const [busy, setBusy] = useState(false) // идёт «Другой вариант»
  const [message, setMessage] = useState(null)
  const last = useRef(0) // номер последнего переключения: поздний ответ на старое не перетирает новый выбор

  async function another() {
    setBusy(true)
    try {
      setDay(await regenerate())
    } catch (err) {
      // 409 и 429 — detail как есть. Экран мог отстать от бэка (вариант добавили или комплект отметили
      // надетым в другой вкладке) — подтягиваем день заново, чтобы кнопки показывали правду
      setMessage(err.message)
      if (err.status === 409 || err.status === 429) getToday().then(setDay).catch((e) => setMessage(e.message))
    } finally {
      setBusy(false)
    }
  }

  async function select(id) {
    if (busy || id === day.selected_id) return
    const before = day
    const n = ++last.current
    // Показываем выбранный вариант сразу; не вышло — возвращаем прежний и говорим почему
    setDay({ ...day, selected_id: id })
    try {
      const fresh = await selectVariant(id)
      if (n === last.current) setDay(fresh)
    } catch (err) {
      if (n === last.current) setDay(before)
      setMessage(err.message)
    }
  }

  // Соседний вариант: +1 — следующий, −1 — предыдущий. За краями списка ничего не делаем
  function step(delta) {
    const i = day.variants.findIndex((v) => v.id === day.selected_id)
    const target = day.variants[i + delta]
    if (target) select(target.id)
  }

  return { busy, message, clearMessage: () => setMessage(null), another, select, step }
}
