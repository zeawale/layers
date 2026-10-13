import { useEffect, useRef, useState } from 'react'

import { searchCities } from '../api/geo.js'

// Название города по координатам бэк узнаёт только при сохранении (PATCH /users/me) —
// до этого в поле эта подпись
const MY_LOCATION = 'Моё местоположение'

// Геолокация: ответ на запрос доступа ждём не дольше 10 с, позицию не старше 10 минут берём из кеша
const GEO_OPTIONS = { timeout: 10000, maximumAge: 600000 }

// «Моё местоположение» — подпись, а не название: правка поля начинается с чистого листа.
// Стёрли букву — поле пустое, дописали — остаётся только дописанное
function withoutLocationLabel(value) {
  if (value.startsWith(MY_LOCATION)) return value.slice(MY_LOCATION.length)
  if (MY_LOCATION.startsWith(value)) return ''
  return value
}

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
  // Номер последнего действия (ввод или геолокация). Ответы подсказок и геолокации приходят
  // не по порядку — чужой, устаревший ответ не должен затереть то, что человек сделал позже
  const seq = useRef(0)

  useEffect(() => () => {
    clearTimeout(timer.current)
    seq.current += 1
  }, [])

  function changeQuery(input) {
    const value = geo === 'located' ? withoutLocationLabel(input) : input
    const id = ++seq.current
    setQuery(value)
    setSelected(null)
    setError('')
    setNotFound(false)
    setGeo('idle')
    clearTimeout(timer.current)
    // Подсказки — с 3 символов: на 1–2 геокодер ищет только точные совпадения (API.md, GET /geo/cities)
    if (value.trim().length < 3) {
      setCities([])
      return
    }
    timer.current = setTimeout(() => {
      searchCities(value.trim())
        .then((data) => {
          if (id !== seq.current) return
          setCities(data.cities || [])
          setNotFound(!data.cities?.length)
        })
        // Геокодер не ответил (502) — говорим об этом, а не молча оставляем пустой список
        .catch((err) => {
          if (id !== seq.current) return
          setCities([])
          setError(err.message)
        })
    }, 300)
  }

  // Список после выбора не прячем, как в макетах 1.6 и 4.3: видно, какой из одноимённых городов выбран
  function select(city) {
    // Выбрали город, пока шла геолокация, — её поздний ответ выбор не затрёт
    seq.current += 1
    setGeo('idle')
    setSelected(city)
    setQuery(city.name)
  }

  function geolocate() {
    const id = ++seq.current
    // Отложенный поиск по введённому не должен приехать после «Город определён»
    clearTimeout(timer.current)
    setCities([])
    setNotFound(false)
    setError('')
    if (!navigator.geolocation) {
      setGeo('failed')
      return
    }
    setGeo('locating')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (id !== seq.current) return
        setSelected({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setQuery(MY_LOCATION)
        setGeo('located')
      },
      () => {
        if (id === seq.current) setGeo('failed')
      },
      GEO_OPTIONS,
    )
  }

  // Ошибка PATCH /users/me — показываем там же, где выбирали город (API.md, «Профиль»).
  // По координатам 400 (точка в море) и 502 (Nominatim молчит) — «Не удалось определить город» (1.6.3), поле пустое для ручного ввода.
  // По названию 400 — «Город не найден» под полем (1.6.4).
  // Возвращает true, если ошибка про город и показана здесь; иначе экран показывает её сам
  function fail(err) {
    const byCoords = selected?.lat != null && !selected?.name
    if (byCoords && (err.status === 400 || err.status === 502)) {
      seq.current += 1
      setSelected(null)
      setQuery('')
      setGeo('failed')
      return true
    }
    if (!selected && err.status === 400) {
      setNotFound(true)
      return true
    }
    return false
  }

  // Поля для PATCH /users/me: выбранный город — с координатами, иначе по названию (API.md, «Профиль»)
  let fields = null
  if (selected?.lat != null && selected?.lon != null) {
    fields = { lat: selected.lat, lon: selected.lon, ...(selected.name && { city: selected.name }) }
  } else if (query.trim()) {
    fields = { city: query.trim() }
  }

  return { query, cities, selected, error, notFound, geo, changeQuery, select, geolocate, fail, fields }
}
