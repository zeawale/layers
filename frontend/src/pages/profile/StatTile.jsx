import { Skeleton, Typography } from '@mui/material'

import ProfileCard from './ProfileCard.jsx'

// Счётчик под шапкой профиля (4.2): число и подпись, плитка 107×73.
// loading — плашки на месте текста той же высоты, чтобы ряд не прыгал, когда придут числа
export default function StatTile({ value, label, loading = false }) {
  return (
    <ProfileCard sx={{ flex: 1, minWidth: 0, p: 1.75 }}>
      <Typography variant="h3" sx={{ mb: 0.5 }}>{loading ? <Skeleton width={36} /> : value}</Typography>
      <Typography variant="caption" component="p" noWrap sx={{ color: 'text.secondary' }}>
        {loading ? <Skeleton width="70%" /> : label}
      </Typography>
    </ProfileCard>
  )
}
