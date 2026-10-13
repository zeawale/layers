import { Typography } from '@mui/material'

import ProfileCard from './ProfileCard.jsx'

// Счётчик под шапкой профиля (4.2): число и подпись, плитка 107×73
export default function StatTile({ value, label }) {
  return (
    <ProfileCard sx={{ flex: 1, minWidth: 0, p: 1.75 }}>
      <Typography variant="h3" sx={{ mb: 0.5 }}>{value}</Typography>
      <Typography variant="caption" component="p" noWrap sx={{ color: 'text.secondary' }}>{label}</Typography>
    </ProfileCard>
  )
}
