'use client'

import { useState, useRef, useEffect } from 'react'
import ChatMessage from '@/components/ChatMessage'
import ChatInput from '@/components/ChatInput'
import { Box, Container, Paper, Typography, Button } from '@mui/material'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (message: string) => {
    setLoading(true)
    setAuthError(null)
    
    const userMessage: Message = { role: 'user', content: message }
    setMessages(prev => [...prev, userMessage])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage]
        }),
      })
  
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthError(data.error || 'You are not authorized to use this feature')
          setMessages([]) // Clear messages when unauthorized
          return
        }
        throw new Error(data.error || 'An error occurred')
      }
  
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  if (authError) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              {authError}
            </Typography>
            <Button
              variant="contained"
              onClick={() => router.push('/')}
              sx={{ mt: 2 }}
            >
              Return to Home
            </Button>
          </Paper>
        </Box>
      </Container>
    )
  }
  return (
    <Container 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3
      }}
    >
      <Paper 
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 'lg',
          height: '600px',
          bgcolor: 'grey.900',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <Box 
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {messages.map((message, index) => (
            <ChatMessage 
              key={index}
              role={message.role}
              content={message.content}
            />
          ))}
          {loading && (
            <ChatMessage 
              role="assistant"
              content="Thinking..."
              loading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </Box>
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </Paper>
    </Container>
  )
}