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
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';

function AuthContent() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';

  const handleLogin = () => {
    // Navigate to actual login handler with the original redirect URL
    const loginUrl = new URL('/cgi-authorize/login', window.location.origin);
    loginUrl.searchParams.set('redirect_url', redirectUrl);
    window.location.href = loginUrl.toString();
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'primary.light', 
              color: 'primary.main',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <LockIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
            Access Restricted
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
            This resource is protected and requires authentication to access.
            Please sign in with your authorized account to continue.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={handleLogin}
            startIcon={<LoginIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)'
            }}
          >
            Proceed to Login
          </Button>
          
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
            Gateway Security Check
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
}

export default function AuthLandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
