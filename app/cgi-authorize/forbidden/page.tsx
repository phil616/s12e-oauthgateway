'use client';

import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Fade
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function ForbiddenPage() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #fff5f5 100%)',
            border: '1px solid rgba(255,0,0,0.05)'
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
            <BlockIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
            Access Denied
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
            You have successfully signed in, but your account is not authorized to access this resource.
            Please contact the administrator if you believe this is a mistake.
          </Typography>

          <Button
            variant="outlined"
            color="inherit"
            size="large"
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Return Home
          </Button>
          
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
            Gateway Security Check
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
}
