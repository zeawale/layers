import { useRef } from 'react'

// Свайп пальцем влево-вправо: обработчики касаний для блока. Вертикальная прокрутка страницы не мешает:
// засчитываем только жест длиннее 40 px, заметно больше горизонтальный, чем вертикальный
export default function useSwipe({ onLeft, onRight }) {
  const start = useRef(null)
  return {
    onTouchStart: (e) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
      if (dx < 0) onLeft?.()
      else onRight?.()
    },
  }
}
