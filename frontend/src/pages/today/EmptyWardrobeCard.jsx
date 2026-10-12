import { Button, Typography } from '@mui/material'
import CheckroomOutlined from '@mui/icons-material/CheckroomOutlined'

import IconCircle from '../../components/IconCircle.jsx'
import Panel from '../../components/Panel.jsx'

// Макет 2.9 «Сегодня · пустой гардероб»: погода есть, собирать не из чего
export default function EmptyWardrobeCard({ onAdd }) {
  return (
    <Panel sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <IconCircle sx={{ mb: 2.5 }}><CheckroomOutlined /></IconCircle>
      <Typography variant="h3" component="h2" sx={{ mb: 1.5 }}>В гардеробе пока пусто</Typography>
      <Typography sx={{ color: 'text.secondary', mb: 3 }}>Добавь вещи — и мы соберём комплект под погоду.</Typography>
      <Button variant="contained" size="large" fullWidth onClick={onAdd}>Добавить вещи</Button>
    </Panel>
  )
}
