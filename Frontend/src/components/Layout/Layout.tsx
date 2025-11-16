import React, { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Badge,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Assignment,
  Assessment,
  Settings,
  People,
  Business,
  AccountCircle,
  Logout,
  Password,
  Add as AddIcon,
  NotificationsNone,
  Help,
  Lightbulb,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 220;

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles?: string[];
  show?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isLoading } = useAuth();
  // Show loading screen while authenticating
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: '#6366f1' }}>
            5S Denetim Platformu
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Yükleniyor...
          </Typography>
        </Box>
      </Box>
    );
  }

  const navItems: NavItem[] = [
    {
      text: 'Anasayfa',
      icon: <Home fontSize="small" />,
      path: '/dashboard',
      show: true,
    },
    {
      text: 'Denetimler',
      icon: <Assignment fontSize="small" />,
      path: '/audits',
      show: true,
    },
    {
      text: 'Raporlar',
      icon: <Assessment fontSize="small" />,
      path: '/reports',
      show: true,
    },
    {
      text: 'Bölümler',
      icon: <Business fontSize="small" />,
      path: '/departments',
      show: true,
    },
    {
      text: 'Alanlar',
      icon: <Business fontSize="small" />,
      path: '/areas',
      show: true,
    },
    {
      text: 'Kullanıcılar',
      icon: <People fontSize="small" />,
      path: '/users',
      show: true,
    },
    {
      text: 'Ayarlar',
      icon: <Settings fontSize="small" />,
      path: '/settings',
      show: true,
    },
    {
      text: 'Yardım',
      icon: <Help fontSize="small" />,
      path: '/help',
      show: true,
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    // No redirect - stay on current page in offline mode
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const handleChangePassword = () => {
    navigate('/change-password');
    handleMenuClose();
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.200' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Assignment sx={{ fontSize: 16, color: 'white' }} />
          </Box>
          <Typography variant="h6" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
            5S Platform
          </Typography>
        </Box>
      </Box>

      <Box sx={{ flex: 1, p: 1, display: 'flex', flexDirection: 'column' }}>
        <List dense sx={{ flex: 1 }}>
          {navItems.filter(item => item.show !== false).map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setMobileOpen(false);
                  }
                }}
                sx={{
                  borderRadius: '6px',
                  minHeight: '32px',
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        
        {/* A-Kaizen Button - Below menu items */}
        <Box sx={{ p: 1, pt: 0, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            startIcon={<Lightbulb />}
            onClick={() => {
              window.open('https://akaizen.example.com', '_blank');
              if (isMobile) {
                setMobileOpen(false);
              }
            }}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              py: 1,
              borderRadius: '8px',
              textTransform: 'none',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #dc2626 100%)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            A-Kaizen Öneri Sistemine Git
          </Button>
        </Box>
      </Box>

      {user && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'grey.200', p: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>
                {user.role || user.Role || 'Kullanıcı'}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid',
          borderColor: 'grey.200',
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important', px: 2 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
            size="small"
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontSize: '0.875rem', fontWeight: 600 }}>
            5S Denetim Platformu
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" color="inherit">
              <Badge badgeContent={3} color="secondary">
                <NotificationsNone fontSize="small" />
              </Badge>
            </IconButton>
            
            {user && (
              <IconButton
                size="small"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                  {user.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 160,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        <MenuItem onClick={handleProfileClick} sx={{ fontSize: '0.75rem', py: 1 }}>
          <ListItemIcon>
            <AccountCircle fontSize="small" />
          </ListItemIcon>
          Profil
        </MenuItem>
        <MenuItem onClick={handleChangePassword} sx={{ fontSize: '0.75rem', py: 1 }}>
          <ListItemIcon>
            <Password fontSize="small" />
          </ListItemIcon>
          Şifre Değiştir
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ fontSize: '0.75rem', py: 1 }}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Çıkış
        </MenuItem>
      </Menu>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              border: 'none',
              borderRight: '1px solid',
              borderColor: 'grey.200',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0.5, // Further reduced padding for minimal side spacing
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: '48px !important' }} />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;