// src/pages/Dashboard/components/Sidebar.jsx
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  IconButton,
  Drawer,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Person as ProfileIcon,
  Group as GroupIcon,
  Compare as MatchingIcon,
  BarChart as ProgressIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  MeetingRoom
} from '@mui/icons-material';
import useAuthStore from '../../../contexts/authStore';

const menuItems = [
  { 
    text: 'Dashboard', 
    icon: <DashboardIcon />, 
    path: '/dashboard' 
  },
  { 
    text: 'My Profile', 
    icon: <ProfileIcon />, 
    path: '/profile' 
  },
  { 
    text: 'Study Groups', 
    icon: <GroupIcon />, 
    path: '/groups' 
  },
  { 
    text: 'Peer Matching', 
    icon: <MatchingIcon />, 
    path: '/matching' 
  },
  // { 
  //   text: 'Progress', 
  //   icon: <ProgressIcon />, 
  //   path: '/progress' 
  // },
  { 
    text: 'Messages', 
    icon: <MessageIcon />, 
    path: '/messages' 
  },
  {
    text: 'Schedule Meeting', 
    icon: <MeetingRoom />, 
    path: 'https://metube-fredio-call-xv4s.vercel.app/' 
  }
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuthStore();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    // Use the Zustand auth store to logout
    const success = await logout();
    if (success) {
      navigate('/login');
    }
  };

  const sidebarContent = (
    <Box 
      sx={{ 
        width: 240, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: '#0A0C40', // Dark blue background from design
        color: 'white'
      }}
    >
      {/* Logo area */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center', 
          py: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'white',
            display: 'inline-block'
          }} />
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'white',
            display: 'inline-block'
          }} />
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%', 
            bgcolor: 'white',
            display: 'inline-block'
          }} />
        </Box>
        <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
          PEER NETWORK
        </Typography>
      </Box>
      
      {/* Menu items */}
      <List sx={{ flexGrow: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path}
            key={item.text}
            sx={{ 
              borderRadius: 2,
              mb: 1,
              bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.15)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      {/* Logout button */}
      <List sx={{ px: 2, pb: 2 }}>
        <ListItem 
          button 
          onClick={handleLogout}
          sx={{ 
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.15)'
            }
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Log Out" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ position: 'fixed', top: 10, left: 10, zIndex: 1100 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
          }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <Box
          component="nav"
          sx={{
            width: { sm: 240 },
            flexShrink: { sm: 0 }
          }}
        >
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box' },
            }}
            open
          >
            {sidebarContent}
          </Drawer>
        </Box>
      )}
    </>
  );
};

export default Sidebar;