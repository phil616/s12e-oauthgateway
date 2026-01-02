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
import CloudOffIcon from '@mui/icons-material/CloudOff';
import RefreshIcon from '@mui/icons-material/Refresh';

function OfflineContent() {
  const searchParams = useSearchParams();
  const retryUrl = searchParams.get('retry_url') || '/';

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 100%)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'grey.200', 
              color: 'grey.600',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <CloudOffIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
            Service Unavailable
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
            The upstream server is currently unreachable. This might be a temporary issue or maintenance.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            size="large"
            href={retryUrl}
            startIcon={<RefreshIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            Try Again
          </Button>
          
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
            Gateway Error: 502 Bad Gateway
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
}

export default function OfflinePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OfflineContent />
    </Suspense>
  );
}
