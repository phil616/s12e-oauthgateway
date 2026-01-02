'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Fade
} from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import HomeIcon from '@mui/icons-material/Home';
import RefreshIcon from '@mui/icons-material/Refresh';

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred during authentication.';

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #fff8f8 100%)',
            border: '1px solid rgba(211,47,47,0.1)'
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'error.light', 
              color: 'error.main',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <ErrorIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
            Authentication Error
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
            {errorMessage}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              href="/"
              startIcon={<HomeIcon />}
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none'
              }}
            >
              Go Home
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => window.location.reload()}
              startIcon={<RefreshIcon />}
              sx={{ 
                px: 3, 
                py: 1.5, 
                borderRadius: 2,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
              }}
            >
              Try Again
            </Button>
          </Box>
          
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
            Gateway System
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
