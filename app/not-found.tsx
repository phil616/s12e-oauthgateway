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
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HomeIcon from '@mui/icons-material/Home';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fafafa' }}>
      <Fade in={true} timeout={800}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 5, 
            textAlign: 'center', 
            borderRadius: 4,
            background: 'linear-gradient(145deg, #ffffff 0%, #f0f7ff 100%)',
            border: '1px solid rgba(33, 150, 243, 0.1)'
          }}
        >
          <Box 
            sx={{ 
              width: 80, 
              height: 80, 
              borderRadius: '50%', 
              bgcolor: 'info.light', 
              color: 'info.main',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              mx: 'auto',
              mb: 3
            }}
          >
            <SearchOffIcon sx={{ fontSize: 40 }} />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4, fontSize: '1.1rem' }}>
            The page you are looking for does not exist or has been moved.
          </Typography>

          <Button
            variant="contained"
            color="info"
            size="large"
            href="/"
            startIcon={<HomeIcon />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 12px rgba(33, 150, 243, 0.25)'
            }}
          >
            Back to Home
          </Button>
          
          <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
            Error Code: 404
          </Typography>
        </Paper>
      </Fade>
    </Container>
  );
}
