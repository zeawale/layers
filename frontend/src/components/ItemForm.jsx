import { useId } from 'react'
import { Box, Button, Chip, MenuItem, Typography } from '@mui/material'

import FormField from './FormField.jsx'

// Форма вещи — макеты 3.6 «Проверка полей» и 3.9 «Редактировать вещь».
// Значения и подписи — только из справочника (attrs = ответ GET /attributes).
// auto — какие поля предзаполнило распознавание: у них метка «авто».
// errors — ошибки 422 по полям, уже по-русски: { name: '…' }.

function AutoLabel({ text, auto }) {
  return (
    <>
      {text}
      {auto && <Chip label="авто" size="small" color="success" variant="outlined" sx={{ ml: 1, height: 20 }} />}
    </>
  )
}

// Ряд «таблеток»: один выбор (стиль, защита от осадков) или несколько (сезон).
// Подпись группы связана с ней через aria-labelledby — читалка назовёт группу
function ToggleRow({ label, options, isActive, onToggle }) {
  const labelId = useId()
  return (
    <Box role="group" aria-labelledby={labelId}>
      <Typography id={labelId} variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>{label}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {options.map((o) => {
          const active = isActive(o.value)
          return (
            <Chip
              key={String(o.value)}
              label={o.label}
              onClick={() => onToggle(o.value)}
              aria-pressed={active}
              color={active ? 'primary' : 'default'}
              variant={active ? 'filled' : 'outlined'}
              sx={{ height: 40, borderRadius: 999, px: 1, bgcolor: active ? undefined : 'background.paper' }}
            />
          )
        })}
      </Box>
    </Box>
  )
}

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
        value={value.name}
        onChange={(e) => set('name')(e.target.value)}
        required
        error={errors.name}
        slotProps={{ htmlInput: { maxLength: 100 } }}
      />

      <FormField
        select
        label={<AutoLabel text="Категория" auto={auto.category} />}
        value={value.category ?? ''}
        onChange={(e) => set('category')(e.target.value)}
        required
        error={errors.category}
      >
        {attrs.category.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
      </FormField>

      <FormField
        select
        label={<AutoLabel text="Цвет" auto={auto.color} />}
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
  category: 'Выберите категорию',
  color: 'Выберите цвет',
  warmth: 'Выберите теплоту',
}

export function itemFieldErrors(fields = {}) {
  return Object.fromEntries(Object.keys(fields).map((f) => [f, FIELD_ERRORS[f] ?? 'Проверьте это поле']))
}
