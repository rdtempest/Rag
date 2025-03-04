'use client'

import { Box, Container, Typography, Button, Paper } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'

export default function Welcome() {
  const router = useRouter()
  const { data: session } = useSession()
  const permissions: { canChat?: boolean; canPredict?: boolean } = session?.user?.permissions || {};

  return (
    <Container maxWidth="lg">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', borderRadius: 2, bgcolor: 'background.paper', maxWidth: 600 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to AI Chat
          </Typography>
          <Typography variant="h6" color="text.secondary" paragraph>
            Experience intelligent conversations powered by advanced AI technology
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {session ? (
              <>
                {permissions.canChat && (
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/chat')}
                  >
                    Start Chatting
                  </Button>
                )}
                {permissions.canPredict && (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/age')}
                  >
                    Try Age Predictor
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => signIn('google')}
                >
                  Sign in to Chat
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}