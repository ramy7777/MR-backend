import React from 'react';
import { Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import AdminDevices from './AdminDevices';
import UserDevices from './UserDevices';

const Devices = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <Box>
      {isAdmin ? <AdminDevices /> : <UserDevices />}
    </Box>
  );
};

export default Devices;
