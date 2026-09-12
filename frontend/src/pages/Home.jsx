import { useEffect, useState } from 'react'
import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material'

import { api } from '../api/client.js'

export default function Home() {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    api('/health')
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4">Layers</Typography>
        <Typography color="text.secondary">
          Каркас приложения. Здесь будет главный экран с комплектом на сегодня.
        </Typography>

        {error && <Alert severity="error">Бэкенд не отвечает: {error}</Alert>}
        {!error && !status && <CircularProgress size={24} />}
        {status && <Alert severity="success">Бэкенд на связи: {status}</Alert>}
      </Box>
    </Container>
  )
}
