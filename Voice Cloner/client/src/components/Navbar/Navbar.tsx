import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Mic,
  Notifications,
  AccountCircle,
  Settings,
  Logout,
  VolumeUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { logout } from '../../store/slices/authSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { notifications } = useAppSelector((state) => state.ui) as any;
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const unreadNotifications = notifications.filter((n: any) => !n.read).length;

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  const navigationItems = [
    { path: '/', label: 'Home', icon: <VolumeUp /> },
    { path: '/dashboard', label: 'Analytics', icon: <Settings /> },
    { path: '/voice-cloning', label: 'Voice Cloning', icon: <Mic /> },
    { path: '/real-time', label: 'Real-time', icon: <VolumeUp /> },
    { path: '/library', label: 'Library', icon: <VolumeUp /> },
  ];

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(15, 15, 35, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
          <Mic sx={{ mr: 1, color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #f59e0b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Voice Cloner
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mr: 'auto' }}>
          {navigationItems.map((item) => (
            <Button
              key={item.path}
              color="inherit"
              onClick={() => navigate(item.path)}
              startIcon={item.icon}
              sx={{
                backgroundColor: location.pathname === item.path ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Badge badgeContent={unreadNotifications} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={() => navigate('/settings')}>
              <Settings />
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile">
            <IconButton
              color="inherit"
              onClick={handleProfileMenuOpen}
              sx={{ ml: 1 }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {user?.name?.charAt(0) || <AccountCircle />}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleMenuClose}>
              <AccountCircle sx={{ mr: 1 }} />
              Profile
            </MenuItem>
            <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
              <Settings sx={{ mr: 1 }} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;