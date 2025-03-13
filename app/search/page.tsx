'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import SearchMessage from '@/components/SearchMessage'
import SearchInput from '@/components/SearchInput'
import { SearchRequest } from '@/components/SearchRequest'
import { Box, Container, Paper, Typography, Button, Drawer } from '@mui/material'
import { useRouter } from 'next/navigation'

export default function Search() {
  const router = useRouter()
  const [searchRequest, setSearchRequest] = useState<SearchRequest | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  // New state for the document panel
  const [documentPanel, setDocumentPanel] = useState({
    open: false,
    documentId: '',
    documentText: ''
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [])

  const handleSendMessage = async (message: string) => {
    setLoading(true)
    setAuthError(null)
    
    const defaultSearchRequest: SearchRequest = { SemanticSearchPhrase: 'Email', SearchResult: [{document_id:'abc', document_summary: 'Thinking...'}] }
    const userSearchRequest: SearchRequest = defaultSearchRequest;
    userSearchRequest.SemanticSearchPhrase= message;
    setSearchRequest(userSearchRequest)
    console.log('searchRequest:', searchRequest);
    console.log('userSearchRequest:', userSearchRequest)
  
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          searchRequest: userSearchRequest
        }),
      })
  
      const data = await response.json()
      console.log('data:', data)

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthError(data.error || 'You are not authorized to use this feature')
          setSearchRequest(undefined) // Clear messages when unauthorized
          return
        }
        throw new Error(data.error || 'An error occurred')
      }

      // Parse the JSON string if data is a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;

      const searchRes: SearchRequest = {
        SemanticSearchPhrase: userSearchRequest?.SemanticSearchPhrase || '',
        SearchResult: Array.isArray(parsedData) ? parsedData : [{ document_id: 'qqq', document_summary: '' }]
      }
      
      console.log('searchRequest 1:', searchRequest);
      console.log('about to setSearchRequest searchRes:', searchRes) ;
      setSearchRequest(searchRes);
 
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: SearchRequest = defaultSearchRequest;
      errorMessage.SearchResult[0].document_id = 'err'; // Set error message
      errorMessage.SearchResult[0].document_summary = ''; // Set error message
      setSearchRequest(errorMessage)
      setAuthError('An error occurred')
      setSearchRequest(undefined) // Clear messages when unauthorized
    } finally {
      setLoading(false)
      console.log('searchRequest: 2', searchRequest);
    }
  }

  // New function to handle document click using existing document_text
  const handleDocumentClick = (documentId: string, documentText: string) => {
    setDocumentPanel({
      open: true,
      documentId: documentId,
      documentText: documentText
    })
  }

  // Function to close the document panel
  const handleCloseDocumentPanel = () => {
    setDocumentPanel(prev => ({
      ...prev,
      open: false
    }))
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
          {searchRequest?.SemanticSearchPhrase && (
            <SearchMessage 
              key={1}
              role={'user'}
              content={searchRequest.SemanticSearchPhrase}
            />
          )}
          {searchRequest?.SearchResult && (
            <SearchMessage 
              key={2}
              role={'assistant'}
              content={
                (() => {
                  const searchResultContent: ReactNode = (
                  <Box component="span">
                      {searchRequest.SearchResult.map((result, index) => (
                        <Typography
                          display={'block'}
                          key={`${result.document_id}-${index}`}
                          component="span"
                          sx={{ mb: 1 }}
                        >
                          <Box 
                            component="span" 
                            sx={{ 
                              color: 'blue', 
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              '&:hover': {
                                textDecoration: 'underline'
                              }
                            }}
                            onClick={() => {
                                if (result.document_text) {
                                  handleDocumentClick(result.document_id, result.document_text)
                                }
                              }}
                                                        >
                            {result.document_id}
                          </Box>
                          <Box component="span" sx={{ color: 'green', fontStyle: 'italic' }}>
                            : {result.document_summary}
                          </Box>
                        </Typography>
                      ))}
                    </Box>
                  );
                  return searchResultContent;
                })()
              }
            />
          )}
          {loading && (
            <SearchMessage 
              role="assistant"
              content="Thinking..."
              loading={true}
            />
          )}
          <div ref={messagesEndRef} />
        </Box>
        <SearchInput onSendMessage={handleSendMessage} disabled={loading} />
      </Paper>

      {/* Document Text Panel */}
      <Drawer
        anchor="right"
        open={documentPanel.open}
        onClose={handleCloseDocumentPanel}
      >
        <Box
          sx={{
            width: 800,
            p: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Document: {documentPanel.documentId}
            </Typography>
            <Button onClick={handleCloseDocumentPanel}>Close</Button>
          </Box>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              flexGrow: 1,
              overflowY: 'auto',
              bgcolor: 'background.paper',
              borderRadius: 1
            }}
          >
            <Typography component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
              {documentPanel.documentText}
            </Typography>
          </Paper>
        </Box>
      </Drawer>
    </Container>
  )
}