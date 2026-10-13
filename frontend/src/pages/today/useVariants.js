import { useRef, useState } from 'react'

import { getToday, regenerate, selectVariant } from '../../api/outfit.js'

const selectedOf = (day) => day?.variants.find((v) => v.id === day.selected_id)

// Варианты комплекта на сегодня (макеты 2.0, 2.1, 2.8): «Другой вариант» и переключение между готовыми.
// Каждый ответ бэка — OutfitDay целиком, экран перерисовывается из него. notify(текст) — уведомление экрана.
// Пока выбранный вариант отмечен «надет», переключать и собирать новый нельзя (API.md, feedback)
export default function useVariants(day, setDay, notify) {
  // Идёт «Другой вариант» или сохраняется переключение. Запросы по одному: несколько переключений подряд
  // бэк может применить не по порядку — на экране один вариант, выбран другой, и «Надет» падает с 400
  const [busy, setBusy] = useState(false)
  const pending = useRef(false) // то же, но видно сразу, до перерисовки: второе касание подряд не проскочит
  // Дата, на которую «Другой вариант» ответил 409 «другого варианта нет». Дальше кнопка — как при
  // исчерпанном лимите: новых вариантов сегодня не будет, кнопка неактивна (API.md, OutfitDay)
  const [exhausted, setExhausted] = useState(null)

  const locked = Boolean(selectedOf(day)?.feedback?.worn)
  const canMore = Boolean(day) && day.variants.length < day.variants_max && exhausted !== day.date

  async function run(action) {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    try {
      await action()
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  function another() {
    if (!canMore || locked) return
    return run(async () => {
      try {
        setDay(await regenerate())
      } catch (err) {
        // 409 и 429 — detail как есть. Экран мог отстать от бэка (вариант добавили или комплект отметили
        // надетым в другой вкладке) — подтягиваем день заново, чтобы кнопки показывали правду
        notify(err.message)
        if (err.status !== 409 && err.status !== 429) return
        try {
          const fresh = await getToday()
          setDay(fresh)
          // 409 без отметки «надет» — движок не нашёл ничего нового (API.md, regenerate)
          if (err.status === 409 && !selectedOf(fresh)?.feedback?.worn) setExhausted(fresh.date)
        } catch (e) {
          notify(e.message)
        }
      }
    })
  }

  function select(id) {
    if (locked || id === day.selected_id) return
    const before = day
    return run(async () => {
      // Показываем выбранный вариант сразу; не вышло — возвращаем прежний и говорим почему
      setDay((d) => ({ ...d, selected_id: id }))
      try {
        setDay(await selectVariant(id))
      } catch (err) {
        setDay(before)
        notify(err.message)
      }
    })
  }

  // Соседний вариант: +1 — следующий, −1 — предыдущий. За краями списка ничего не делаем
  function step(delta) {
    const i = day.variants.findIndex((v) => v.id === day.selected_id)
    const target = day.variants[i + delta]
    if (target) select(target.id)
  }

  return { busy, locked, canMore, another, select, step }
}
