import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

// Сохранение на экране правки: «Сохраняем…» на кнопке, ошибка с бэка — над ней,
// поля, не прошедшие проверку (422), — в fields, чтобы экран показал свой текст под полем
export default function useSave() {
  const context = useOutletContext()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState({})

  async function run(changes) {
    setError('')
    setFields({})
    setSaving(true)
    try {
      await context.save(changes)
    } catch (err) {
      if (err.fields) setFields(err.fields)
      else setError(err.message)
      setSaving(false)
    }
  }

  return { ...context, saving, error, fields, run }
}
