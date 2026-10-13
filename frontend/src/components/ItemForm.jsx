import { Box, Button, MenuItem } from '@mui/material'
import EditOutlined from '@mui/icons-material/EditOutlined'

import AutoChip from './AutoChip.jsx'
import ColorDot from './ColorDot.jsx'
import FormField from './FormField.jsx'
import ToggleRow from './ToggleRow.jsx'

// Форма вещи — макеты 3.6 «Проверка полей» и 3.9 «Редактировать вещь».
// Значения и подписи — только из справочника (attrs = ответ GET /attributes).
// auto — какие поля предзаполнило распознавание: у них метка «авто» внутри поля, перед стрелкой (3.6).
// errors — ошибки 422 по полям, уже по-русски: { name: '…' }.
// loading — идёт сохранение («Сохраняем…»); disabled — кнопка неактивна по другой причине (грузится фото)
export default function ItemForm({ attrs, value, onChange, auto = {}, errors = {}, onSubmit, submitLabel, loading, disabled }) {
  const set = (field) => (v) => onChange({ ...value, [field]: v })

  function toggleSeason(s) {
    set('season')(value.season.includes(s) ? value.season.filter((x) => x !== s) : [...value.season, s])
  }

  const ready = value.name.trim() && value.category && value.color && value.warmth

  return (
    <Box
      component="form"
      onSubmit={(e) => { e.preventDefault(); onSubmit() }}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
    >
      <FormField
        label="Название"
        placeholder="Например, серый свитер"
        icon={<EditOutlined />}
        value={value.name}
        onChange={(e) => set('name')(e.target.value)}
        required
        error={errors.name}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />

      <FormField
        select
        label="Категория"
        end={auto.category && <AutoChip />}
        value={value.category ?? ''}
        onChange={(e) => set('category')(e.target.value)}
        required
        error={errors.category}
      >
        {attrs.category.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </FormField>

      <FormField
        select
        label="Цвет"
        icon={value.color && <ColorDot value={value.color} size={20} />}
        end={auto.color && <AutoChip />}
        value={value.color ?? ''}
        onChange={(e) => set('color')(e.target.value)}
        required
        error={errors.color}
      >
        {attrs.color.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </FormField>

      <FormField
        select
        label="Теплота"
        value={value.warmth ?? ''}
        onChange={(e) => set('warmth')(e.target.value)}
        required
        error={errors.warmth}
      >
        {attrs.warmth.map((o) => <MenuItem key={o.value} value={o.value}>{`${o.value} — ${o.label}`}</MenuItem>)}
      </FormField>

      <ToggleRow label="Сезон" options={attrs.season} isActive={(s) => value.season.includes(s)} onToggle={toggleSeason} />

      {/* Повторное нажатие снимает выбор: без стиля вещь подходит под любой */}
      <ToggleRow
        label="Стиль"
        options={attrs.style}
        isActive={(s) => value.style === s}
        onToggle={(s) => set('style')(value.style === s ? null : s)}
      />

      <ToggleRow
        label="Защита от осадков"
        options={attrs.water_resistance}
        isActive={(w) => value.water_resistance === w}
        onToggle={set('water_resistance')}
      />

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || disabled || !ready} sx={{ mt: 1 }}>
        {loading ? 'Сохраняем…' : submitLabel}
      </Button>
    </Box>
  )
}

// Пустая вещь для формы — поля как в Item из API.md
export const EMPTY_ITEM = {
  name: '',
  category: null,
  color: null,
  warmth: null,
  style: null,
  season: [],
  water_resistance: false,
}

// Ошибки 422 по полям вещи — свой текст по-русски вместо английского текста валидатора
const FIELD_ERRORS = {
  name: 'Название — от 1 до 100 символов',
  category: 'Выбери категорию',
  color: 'Выбери цвет',
  warmth: 'Выбери теплоту',
}

export function itemFieldErrors(fields = {}) {
  return Object.fromEntries(Object.keys(fields).map((f) => [f, FIELD_ERRORS[f] ?? 'Проверь это поле']))
}
