import { Typography } from '@mui/material'

import { formatDay, greeting } from '../../format.js'

// «СУББОТА, 26 СЕНТЯБРЯ» и «Доброе утро, Саша» — верх главного экрана во всех состояниях
export default function TodayHeader({ name }) {
  return (
    <>
      <Typography variant="overline" component="p" sx={{ color: 'text.disabled' }}>{formatDay()}</Typography>
      <Typography variant="h2" component="h1" sx={{ mb: 2.75 }}>{greeting(name)}</Typography>
    </>
  )
}
