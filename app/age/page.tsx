'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress
} from '@mui/material'

export default function Age() {
  const [name, setName] = useState('')
  const [robData, setRobData] = useState<{ count: number, name: string, age: number, message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchAge = async () => {
    if (!name.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/age?name=${name}`, {
        method: 'GET',
      })

      const data = await response.json()
      
      if (response.ok) {
        setRobData(data.robInfo)
      } else {
        setError(data.error)
      }
    } catch (err: unknown) {
      const error = err as Error
      setError(`An error occurred while fetching the age data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}>
        <Paper 
          elevation={3}
          sx={{
            width: '100%',
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: 2
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              label="Name"
            />
            <Button
              variant="contained"
              onClick={handleFetchAge}
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} color="inherit" />}
            >
              {loading ? 'Fetching...' : 'Get Age'}
            </Button>
            
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            
            {robData && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1">Name: {robData.name}</Typography>
                <Typography variant="body1">Age: {robData.age}</Typography>
                <Typography variant="body1">Message: {robData.message}</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}