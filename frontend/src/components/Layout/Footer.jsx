import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        mt: 'auto',
        py: 3,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                Trading Platform
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Educational stock trading simulator for students to learn investment strategies
              with virtual TSX stocks.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Box sx={{ textAlign: { xs: 'center', sm: 'right' } }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                <Link
                  href="#"
                  color="text.secondary"
                  underline="hover"
                  variant="body2"
                >
                  About
                </Link>
                <Link
                  href="#"
                  color="text.secondary"
                  underline="hover"
                  variant="body2"
                >
                  Help
                </Link>
                <Link
                  href="#"
                  color="text.secondary"
                  underline="hover"
                  variant="body2"
                >
                  Terms
                </Link>
                <Link
                  href="#"
                  color="text.secondary"
                  underline="hover"
                  variant="body2"
                >
                  Privacy
                </Link>
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            © {currentYear} Trading Platform. Educational use only. 
            Stock prices delayed 15 minutes.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;