import { Paper, Typography, Box, CircularProgress } from '@mui/material'
import { ReactNode } from 'react'

interface SearchMessageProps {
  role: 'user' | 'assistant'
  content: ReactNode  // Change this from string to ReactNode
  loading?: boolean
}

export default function SearchMessage({ role, content, loading }: SearchMessageProps) {
  return (
    <Paper
      sx={{
        p: 2,
        bgcolor: role === 'user' ? 'primary.dark' : 'background.paper',
        maxWidth: '80%',
        alignSelf: role === 'user' ? 'flex-end' : 'flex-start'
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>{content}</Typography>
        </Box>
      ) : (
        <Typography>{content}</Typography>
      )}
    </Paper>
  )
}