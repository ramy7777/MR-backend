import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Devices as DevicesIcon,
  Subscriptions as SubscriptionsIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  open: boolean;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/', requiredRole: null },
  { text: 'Users', icon: <PeopleIcon />, path: '/users', requiredRole: 'admin' },
  { text: 'Devices', icon: <DevicesIcon />, path: '/devices', requiredRole: null },
  { text: 'Subscriptions', icon: <SubscriptionsIcon />, path: '/subscriptions', requiredRole: null },
];

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user in Sidebar:', user);
  }, [user]);

  const filteredItems = menuItems.filter(item => {
    console.log('Checking item:', item.text);
    console.log('Required role:', item.requiredRole);
    console.log('User role:', user?.role);
    return !item.requiredRole || user?.role === item.requiredRole;
  });

  console.log('Filtered menu items:', filteredItems);

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          position: 'relative',
          whiteSpace: 'nowrap',
          width: 240,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          boxSizing: 'border-box',
          ...(!open && {
            overflowX: 'hidden',
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            width: (theme) => theme.spacing(7),
          }),
        },
      }}
    >
      <List sx={{ marginTop: 8 }}>
        {filteredItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Drawer>
  );
};

export default Sidebar;
