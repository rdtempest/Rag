import { useState } from 'react'
import { Paper, TextField, IconButton } from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface SearchInputProps {
  onSendMessage: (message: string) => void
  disabled?: boolean
}

export default function SearchInput({ onSendMessage, disabled }: SearchInputProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        display: 'flex',
        gap: 1,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        variant="outlined"
        size="small"
      />
      <IconButton 
        type="submit" 
        disabled={disabled || !message.trim()}
        color="primary"
      >
        <SendIcon />
      </IconButton>
    </Paper>
  )
}