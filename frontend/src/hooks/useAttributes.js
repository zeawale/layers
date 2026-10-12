import { useCallback, useEffect, useState } from 'react'

import { getAttributes } from '../api/attributes.js'

// Справочник атрибутов (GET /attributes) грузим один раз на приложение:
// все экраны получают один и тот же запрос. При ошибке кеш сбрасывается, чтобы «Повторить» сработало.
let cached = null

function loadAttributes() {
  if (!cached) {
    cached = getAttributes().catch((err) => {
      cached = null
      throw err
    })
  }
  return cached
}

export default function useAttributes() {
  const [attrs, setAttrs] = useState(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true
    setError('')
    loadAttributes()
      .then((data) => active && setAttrs(data))
      .catch((err) => active && setError(err.message))
    return () => { active = false }
  }, [attempt])

  // Подпись для интерфейса по машинному значению: label('category', 'top') → «Верх»
  const label = useCallback(
    (name, value) => attrs?.[name]?.find((o) => o.value === value)?.label ?? value,
    [attrs],
  )

  return {
    attrs,
    label,
    loading: !attrs && !error,
    error,
    retry: () => setAttempt((n) => n + 1),
  }
}
