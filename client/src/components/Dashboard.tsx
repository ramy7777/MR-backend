import React, { useContext } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  Devices as DevicesIcon,
  Subscriptions as SubscriptionsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import CustomerDashboard from './CustomerDashboard';

const data = [
  { name: 'Jan', Users: 4000, Devices: 2400, Subscriptions: 2400 },
  { name: 'Feb', Users: 3000, Devices: 1398, Subscriptions: 2210 },
  { name: 'Mar', Users: 2000, Devices: 9800, Subscriptions: 2290 },
  { name: 'Apr', Users: 2780, Devices: 3908, Subscriptions: 2000 },
  { name: 'May', Users: 1890, Devices: 4800, Subscriptions: 2181 },
  { name: 'Jun', Users: 2390, Devices: 3800, Subscriptions: 2500 },
];

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Icon sx={{ color: 'primary.main', mr: 1 }} />
      <Typography color="textSecondary" variant="h6">
        {title}
      </Typography>
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
    <Typography color="textSecondary" sx={{ flex: 1 }}>
      as of today
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  console.log('Current user in Dashboard:', user);
  return user?.role === 'admin' ? <AdminDashboard /> : <CustomerDashboard />;
};

export default Dashboard;
