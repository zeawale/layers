import { useState } from 'react'
import { Box, Typography } from '@mui/material'
import PersonOutlineIcon from '@mui/icons-material/PersonOutline'

import FormField from '../../components/FormField.jsx'
import SaveButton from './SaveButton.jsx'
import useSave from './useSave.js'

// Макет 4.6 «Как к тебе обращаться». Пустое имя стирает его — приветствия будут без имени
export default function NameEdit() {
  const { user, saving, error, fields, run } = useSave()
  const [name, setName] = useState(user.name ?? '')

  function submit(e) {
    e.preventDefault()
    run({ name: name.trim() || null })
  }

  return (
    <Box component="form" onSubmit={submit}>
      <Typography variant="h2" sx={{ mb: 1.25 }}>Как к тебе обращаться</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.75 }}>
        Имя показываем в приветствии. Необязательно, до 50 символов. Без имени пишем просто «Доброе утро».
      </Typography>
      <Box sx={{ mb: 3 }}>
        <FormField
          label="Имя"
          icon={<PersonOutlineIcon />}
          placeholder="Саша"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="given-name"
          error={fields.name && 'Имя — не длиннее 50 символов'}
          slotProps={{ htmlInput: { maxLength: 50 } }}
        />
      </Box>
      <SaveButton onClick={submit} saving={saving} disabled={name.trim() === (user.name ?? '')} error={error} />
    </Box>
  )
}
