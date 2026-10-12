import { useEffect, useRef, useState } from 'react'

import { searchCities } from '../api/geo.js'

// Выбор города: подсказки GET /geo/cities при вводе и «Определить автоматически».
// Общий для онбординга (1.6) и профиля (4.3). initialQuery — что стоит в поле сразу
export default function useCitySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [cities, setCities] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function changeQuery(value) {
    setQuery(value)
    setSelected(null)
    setError('')
    clearTimeout(timer.current)
    if (value.trim().length < 3) {
      setCities([])
      return
    }
    timer.current = setTimeout(() => {
      searchCities(value.trim())
        .then((data) => setCities(data.cities || []))
        // Геокодер не ответил (502) — говорим об этом, а не молча оставляем пустой список
        .catch((err) => {
          setCities([])
          setError(err.message)
        })
    }, 300)
  }

  // Список после выбора не прячем, как в макетах 1.6 и 4.3: видно, какой из одноимённых городов выбран
  function select(city) {
    setSelected(city)
    setQuery(city.name)
  }

  function geolocate() {
    if (!navigator.geolocation) {
      setError('Браузер не умеет определять местоположение — введи город')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCities([])
        setSelected({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setQuery('Определяем…')
      },
      () => setError('Не удалось определить местоположение — введи город'),
    )
  }

  // Поля для PATCH /users/me: выбранный город — с координатами, иначе по названию (API.md, «Профиль»)
  let fields = null
  if (selected?.lat != null && selected?.lon != null) {
    fields = { lat: selected.lat, lon: selected.lon, ...(selected.name && { city: selected.name }) }
  } else if (query.trim()) {
    fields = { city: query.trim() }
  }

  return { query, cities, selected, error, changeQuery, select, geolocate, fields }
}
