import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const _isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', auth: true },
    { label: 'Stocks', path: '/stocks', auth: true },
    { label: 'Portfolio', path: '/portfolio', auth: true },
    { label: 'Leaderboard', path: '/leaderboard', auth: true },
  ];

  const publicItems = [
    { label: 'Login', path: '/login', auth: false },
    { label: 'Sign Up', path: '/signup', auth: false },
  ];

  const renderDesktopMenu = () => (
    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
      {isAuthenticated ? (
        <>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
        </>
      ) : (
        <>
          {publicItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              sx={{ textTransform: 'none' }}
            >
              {item.label}
            </Button>
          ))}
        </>
      )}
    </Box>
  );

  const renderMobileMenu = () => {
    const items = isAuthenticated ? navigationItems : publicItems;
    
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
          <Typography variant="h6" sx={{ my: 2 }}>
            Trading Platform
          </Typography>
          <List>
            {items.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  sx={{ textAlign: 'center' }}
                  onClick={() => navigate(item.path)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton
                  sx={{ textAlign: 'center' }}
                  onClick={handleLogout}
                >
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    );
  };

  const renderAccountMenu = () => (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id="primary-search-account-menu"
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>
        <Typography variant="body2" color="text.secondary">
          {user?.email}
        </Typography>
      </MenuItem>
      <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <TrendingUp sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              sx={{
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Trading Platform
            </Typography>
          </Box>

          {renderDesktopMenu()}
        </Toolbar>
      </AppBar>
      
      {renderMobileMenu()}
      {renderAccountMenu()}
    </Box>
  );
};

export default Navigation;