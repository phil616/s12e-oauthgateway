'use client';

import React, { useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Fade
} from '@mui/material';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import RefreshIcon from '@mui/icons-material/Refresh';
import HomeIcon from '@mui/icons-material/Home';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error caught:', error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
          <Fade in={true} timeout={800}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 5, 
                textAlign: 'center', 
                borderRadius: 4,
                background: 'linear-gradient(145deg, #ffffff 0%, #fffbf0 100%)',
                border: '1px solid rgba(255, 152, 0, 0.1)'
              }}
            >
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%', 
                  bgcolor: 'warning.light', 
                  color: 'warning.main',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3
                }}
              >
                <ReportProblemIcon sx={{ fontSize: 40 }} />
              </Box>
              
              <Typography variant="h4" component="h1" gutterBottom fontWeight={700} color="text.primary">
                System Error
              </Typography>
              
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 2, fontSize: '1.1rem' }}>
                Something went wrong on our end. We apologize for the inconvenience.
              </Typography>

              {process.env.NODE_ENV !== 'production' && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 2, textAlign: 'left', overflow: 'auto', maxHeight: 200 }}>
                  <Typography variant="caption" fontFamily="monospace" color="error">
                    {error.message}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  href="/"
                  startIcon={<HomeIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  Go Home
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  size="large"
                  onClick={() => reset()}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', color: 'white' }}
                >
                  Try Again
                </Button>
              </Box>
              
              <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 4 }}>
                Error Code: 500
              </Typography>
            </Paper>
          </Fade>
        </Container>
      </body>
    </html>
  );
}
