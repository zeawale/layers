import { useState } from 'react'
import { IconButton } from '@mui/material'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

import FormField from './FormField.jsx'

// Поле пароля с замком — вход, регистрация, сброс и смена пароля.
// toggle — «глазик», чтобы показать пароль: по макетам он есть на экранах нового пароля
export default function PasswordField({ minLength, toggle = false, ...props }) {
  const [visible, setVisible] = useState(false)
  return (
    <FormField
      placeholder="••••••••"
      type={visible ? 'text' : 'password'}
      icon={<LockOutlinedIcon />}
      end={toggle && (
        <IconButton
          edge="end"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? 'Скрыть пароль' : 'Показать пароль'}
          sx={{ color: 'text.secondary' }}
        >
          {visible ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
        </IconButton>
      )}
      slotProps={minLength ? { htmlInput: { minLength } } : undefined}
      {...props}
    />
  )
}
