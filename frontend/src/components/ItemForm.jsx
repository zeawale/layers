import { Box, Button, Chip, MenuItem, TextField, Typography } from '@mui/material'

// Форма вещи — макеты 3.6 «Проверка полей» и 3.9 «Редактировать вещь».
// Значения и подписи — только из справочника (attrs = ответ GET /attributes).
// auto — какие поля предзаполнило распознавание: у них метка «авто».

function Field({ label, auto, children }) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
        {auto && <Chip label="авто" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: 11 }} />}
      </Box>
      {children}
    </Box>
  )
}

// Ряд «таблеток»: один выбор (стиль, защита от осадков) или несколько (сезон)
function ToggleRow({ options, isActive, onToggle }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {options.map((o) => {
        const active = isActive(o.value)
        return (
          <Chip
            key={String(o.value)}
            label={o.label}
            onClick={() => onToggle(o.value)}
            color={active ? 'primary' : 'default'}
            variant={active ? 'filled' : 'outlined'}
            sx={{ height: 40, borderRadius: 999, px: 1, fontSize: 14, bgcolor: active ? undefined : 'background.paper' }}
          />
        )
      })}
    </Box>
  )
}

export default function ItemForm({ attrs, value, onChange, auto = {}, onSubmit, submitLabel, loading }) {
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
      <Field label="Название">
        <TextField
          placeholder="Например, серый свитер"
          value={value.name}
          onChange={(e) => set('name')(e.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 100 } }}
        />
      </Field>

      <Field label="Категория" auto={auto.category}>
        <TextField select value={value.category ?? ''} onChange={(e) => set('category')(e.target.value)} required fullWidth>
          {attrs.category.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      </Field>

      <Field label="Цвет" auto={auto.color}>
        <TextField select value={value.color ?? ''} onChange={(e) => set('color')(e.target.value)} required fullWidth>
          {attrs.color.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
        </TextField>
      </Field>

      <Field label="Теплота">
        <TextField select value={value.warmth ?? ''} onChange={(e) => set('warmth')(e.target.value)} required fullWidth>
          {attrs.warmth.map((o) => <MenuItem key={o.value} value={o.value}>{`${o.value} — ${o.label}`}</MenuItem>)}
        </TextField>
      </Field>

      <Field label="Сезон">
        <ToggleRow options={attrs.season} isActive={(s) => value.season.includes(s)} onToggle={toggleSeason} />
      </Field>

      <Field label="Стиль">
        {/* Повторное нажатие снимает выбор: без стиля вещь подходит под любой */}
        <ToggleRow
          options={attrs.style}
          isActive={(s) => value.style === s}
          onToggle={(s) => set('style')(value.style === s ? null : s)}
        />
      </Field>

      <Field label="Защита от осадков">
        <ToggleRow
          options={attrs.water_resistance}
          isActive={(w) => value.water_resistance === w}
          onToggle={set('water_resistance')}
        />
      </Field>

      <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || !ready} sx={{ mt: 1 }}>
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
