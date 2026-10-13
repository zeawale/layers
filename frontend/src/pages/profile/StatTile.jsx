import { Box, Skeleton, Typography } from '@mui/material'

import ProfileCard from './ProfileCard.jsx'

// Счётчик под шапкой профиля (4.2): число и подпись, плитка 107×73. icon — рядом с числом вместо подписи:
// у комплектов с «Нравится» слово не помещалось (HANDBOOK, раздел 8). Без подписи плитка той же высоты, что соседние: ряд тянет их по самой высокой.
// loading — плашки на месте текста той же высоты, чтобы ряд не прыгал, когда придут числа
export default function StatTile({ value, label, icon, loading = false }) {
  return (
    <ProfileCard sx={{ flex: 1, minWidth: 0, p: 1.75 }}>
      <Typography variant="h3" sx={{ mb: 0.5 }}>
        {loading ? (
          <Skeleton width={36} />
        ) : (
          <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>{value}{icon}</Box>
        )}
      </Typography>
      {(loading || label) && (
        <Typography variant="caption" component="p" noWrap sx={{ color: 'text.secondary' }}>
          {loading ? <Skeleton width="70%" /> : label}
        </Typography>
      )}
    </ProfileCard>
  )
}
