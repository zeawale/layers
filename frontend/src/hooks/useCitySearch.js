import { useEffect, useRef, useState } from 'react'

import { searchCities } from '../api/geo.js'

// Выбор города: подсказки GET /geo/cities при вводе и «Определить автоматически».
// Общий для онбординга (1.6) и профиля (4.3). initialQuery — что стоит в поле сразу
export default function useCitySearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery)
  const [cities, setCities] = useState([])
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  // Подсказок по запросу нет — «Город не найден» под полем (1.6.4)
  const [notFound, setNotFound] = useState(false)
  // «Определить автоматически»: idle → locating (1.6.1) → located (1.6.2) или failed (1.6.3)
  const [geo, setGeo] = useState('idle')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function changeQuery(value) {
    setQuery(value)
    setSelected(null)
    setError('')
    setNotFound(false)
    setGeo('idle')
    clearTimeout(timer.current)
    // Подсказки — от 2 символов (API.md, GET /geo/cities)
    if (value.trim().length < 2) {
      setCities([])
      return
    }
    timer.current = setTimeout(() => {
      searchCities(value.trim())
        .then((data) => {
          setCities(data.cities || [])
          setNotFound(!data.cities?.length)
        })
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

  // Название города по координатам бэк узнаёт только при сохранении (PATCH /users/me) —
  // до этого в поле «Моё местоположение»
  function geolocate() {
    setNotFound(false)
    if (!navigator.geolocation) {
      setGeo('failed')
      return
    }
    setGeo('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCities([])
        setSelected({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setQuery('Моё местоположение')
        setGeo('located')
      },
      () => setGeo('failed'),
    )
  }

  // Поля для PATCH /users/me: выбранный город — с координатами, иначе по названию (API.md, «Профиль»)
  let fields = null
  if (selected?.lat != null && selected?.lon != null) {
    fields = { lat: selected.lat, lon: selected.lon, ...(selected.name && { city: selected.name }) }
  } else if (query.trim()) {
    fields = { city: query.trim() }
  }

  return { query, cities, selected, error, notFound, geo, changeQuery, select, geolocate, fields }
}
