import { Paper, Typography, Box, CircularProgress } from '@mui/material'

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  loading?: boolean
}

export default function ChatMessage({ role, content, loading }: ChatMessageProps) {
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