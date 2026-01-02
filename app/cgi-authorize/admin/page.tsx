'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  GridLegacy as Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Fade,
  InputAdornment
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupIcon from '@mui/icons-material/Group';
import KeyIcon from '@mui/icons-material/Key';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function AdminPage() {
  const [adminSecret, setAdminSecret] = useState('');
  const [domain, setDomain] = useState('');
  const [acl, setAcl] = useState<string[]>([]);
  const [config, setConfig] = useState<{ origin: string; secret: string; host_header: string }>({ origin: '', secret: '', host_header: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [newOrigin, setNewOrigin] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [newHostHeader, setNewHostHeader] = useState('');

  const fetchData = async () => {
    if (!domain || !adminSecret) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/cgi-authorize/api/admin?domain=${domain}`, {
        headers: {
          Authorization: `Bearer ${adminSecret}`,
        },
      });

      if (res.status === 401) {
        throw new Error('Unauthorized: Invalid Admin Secret');
      }
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }

      const data = await res.json();
      setAcl(data.acl);
      setConfig(data.config);
      setNewOrigin(data.config.origin);
      setNewSecret(data.config.secret);
      setNewHostHeader(data.config.host_header || '');
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAcl = async (email: string, action: 'add' | 'remove') => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/cgi-authorize/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminSecret}`,
        },
        body: JSON.stringify({
          domain,
          type: 'acl',
          email,
          action,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update ACL');
      }

      const data = await res.json();
      setAcl(data.acl);
      if (action === 'add') setNewEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/cgi-authorize/api/admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminSecret}`,
          },
          body: JSON.stringify({
            domain,
            type: 'config',
            origin: newOrigin,
            secret: newSecret
          }),
        });
  
        if (!res.ok) {
          throw new Error('Failed to update Config');
        }
  
        const data = await res.json();
        setConfig(data.config);
        alert('Configuration updated successfully!');
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0f2f5', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Toolbar>
          <SecurityIcon color="primary" sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" color="inherit" noWrap sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '-0.5px' }}>
            Gateway Admin
          </Typography>
          {isLoggedIn && (
            <Chip 
              icon={<LanguageIcon />} 
              label={domain} 
              color="primary" 
              variant="outlined" 
              sx={{ fontWeight: 500 }}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {/* Auth Section */}
        <Fade in={true} timeout={800}>
          <Paper 
            elevation={0} 
            sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 3, 
              border: '1px solid rgba(0,0,0,0.08)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)'
            }}
          >
            <Grid container spacing={3} alignItems="flex-end">
              <Grid item component="div" xs={12} md={5}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', ml: 1 }}>
                  ADMIN SECRET
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter secret key"
                  type="password"
                  variant="outlined"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: 'white' }
                  }}
                />
              </Grid>
              <Grid item component="div" xs={12} md={5}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.secondary', ml: 1 }}>
                  TARGET DOMAIN
                </Typography>
                <TextField
                  fullWidth
                  placeholder="e.g. app.example.com"
                  variant="outlined"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon color="action" />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2, bgcolor: 'white' }
                  }}
                />
              </Grid>
              <Grid xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={fetchData}
                  disabled={loading || !domain || !adminSecret}
                  sx={{ 
                    height: 56, 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Connect'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {error && (
          <Fade in={!!error}>
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
              {error}
            </Alert>
          </Fade>
        )}

        {isLoggedIn && (
          <Fade in={isLoggedIn} timeout={1000}>
            <Grid container spacing={4}>
              {/* Backend Config */}
              <Grid xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3, 
                    border: '1px solid rgba(0,0,0,0.08)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', mr: 2 }}>
                        <SettingsIcon />
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        Backend Configuration
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 4 }} />
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <TextField
                        fullWidth
                        label="Origin URL"
                        placeholder="http://localhost:8080"
                        helperText="The upstream server where requests are forwarded."
                        value={newOrigin}
                        onChange={(e) => setNewOrigin(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LinkIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Edge Key (Optional)"
                        placeholder="Shared secret"
                        helperText="Value for X-Edge-Key header sent to origin."
                        value={newSecret}
                        onChange={(e) => setNewSecret(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Host Header (Optional)"
                        placeholder="e.g. backend.local"
                        helperText="Overrides the Host header sent to the origin server. If empty, uses the origin's host."
                        value={newHostHeader}
                        onChange={(e) => setNewHostHeader(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LanguageIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleUpdateConfig}
                        disabled={loading}
                        size="large"
                        sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Save Configuration
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Access Control */}
              <Grid xs={12} md={6}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%', 
                    borderRadius: 3, 
                    border: '1px solid rgba(0,0,0,0.08)',
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.05)'
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'success.light', color: 'success.dark', mr: 2 }}>
                          <GroupIcon />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                          Access Control
                        </Typography>
                      </Box>
                      <Chip 
                        label={`${acl.length} Users`} 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 600, bgcolor: 'success.light', color: 'success.dark' }} 
                      />
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    <List sx={{ flexGrow: 1, maxHeight: 320, overflow: 'auto', bgcolor: '#f8f9fa', borderRadius: 2, mb: 3, border: '1px solid #eee' }}>
                      {acl.length === 0 ? (
                        <ListItem>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, opacity: 0.6 }}>
                                <GroupIcon sx={{ fontSize: 48, mb: 1, color: 'text.disabled' }} />
                                <Typography variant="body2">No authorized users yet</Typography>
                              </Box>
                            } 
                          />
                        </ListItem>
                      ) : (
                        acl.map((email) => (
                          <ListItem key={email} divider sx={{ '&:last-child': { borderBottom: 0 } }}>
                            <ListItemText 
                              primary={email} 
                              primaryTypographyProps={{ fontWeight: 500, fontSize: '0.95rem' }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton edge="end" size="small" onClick={() => handleUpdateAcl(email, 'remove')} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'error.light' } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      )}
                    </List>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="user@example.com"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonAddIcon color="action" fontSize="small" />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 2 }
                        }}
                      />
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdateAcl(newEmail, 'add')}
                        disabled={loading || !newEmail}
                        sx={{ minWidth: 100, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                      >
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        )}
      </Container>
    </Box>
  );
}
