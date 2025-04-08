import React, { useState, useEffect } from 'react';
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
  Inventory as InventoryIcon,
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
import axios from 'axios';

const chartData = [
  { name: 'Jan', Users: 40, Devices: 24, Rentals: 24 },
  { name: 'Feb', Users: 30, Devices: 13, Rentals: 22 },
  { name: 'Mar', Users: 20, Devices: 98, Rentals: 29 },
  { name: 'Apr', Users: 27, Devices: 39, Rentals: 20 },
  { name: 'May', Users: 18, Devices: 48, Rentals: 21 },
  { name: 'Jun', Users: 23, Devices: 38, Rentals: 25 },
];

interface AdminStats {
  userCount: number;
  deviceCount: number;
  rentalCount: number;
}

interface ClientData {
  activeRentals: number;
  availableDevices: number;
}

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ElementType }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      justifyContent: 'space-between',
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      <Icon sx={{ color: 'primary.main', mr: 1.5, fontSize: '2rem' }} />
      <Typography color="text.secondary" sx={{ fontWeight: 'medium' }}> 
        {title}
      </Typography>
    </Box>
    <Typography component="p" variant="h4" sx={{ mb: 1 }}>
      {value}
    </Typography>
  </Paper>
);

const AdminDashboardContent = ({ stats, loading }: { stats: AdminStats | null, loading: boolean }) => {
  if (loading || !stats) {
    return <CircularProgress />;
  }
  
  // Log stats data to console for debugging
  console.log('Admin dashboard stats:', stats);
  
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Total Users" 
          value={stats.userCount} 
          icon={PeopleIcon} 
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard 
          title="Active Devices" 
          value={stats.deviceCount} 
          icon={DevicesIcon} 
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Subscriptions"
          value={stats.rentalCount}
          icon={SubscriptionsIcon}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Monthly Revenue"
          value={`$${stats.deviceCount * 1000}`}
          icon={SubscriptionsIcon}
        />
      </Grid>
      <Grid item xs={12}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
          <Typography variant="h6" gutterBottom>
            Platform Overview
          </Typography>
          <Box sx={{ flexGrow: 1, width: '100%' }}>
            <BarChart
              width={700}
              height={300}
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Users" fill="#8884d8" name="Users" />
              <Bar dataKey="Devices" fill="#82ca9d" name="Devices" />
              <Bar dataKey="Rentals" fill="#ffc658" name="Rentals" />
            </BarChart>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

const ClientDashboardContent = ({ clientData, loading, userName }: { clientData: ClientData | null, loading: boolean, userName: string }) => {
  if (loading || !clientData) {
    return <CircularProgress />;
  }
  return (
     <Box>
        <Typography variant="h5" gutterBottom>
          Welcome, {userName}!
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StatCard title="Your Active Rentals" value={clientData.activeRentals} icon={SubscriptionsIcon} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatCard title="Headsets Available for Rent" value={clientData.availableDevices} icon={InventoryIcon} />
          </Grid>
        </Grid>
     </Box>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        if (user.role === 'admin') {
          // Add debug logging
          console.log('Fetching admin dashboard data...');

          const [usersRes, devicesRes, rentalsRes] = await Promise.all([
            axios.get('http://localhost:3001/api/users'),
            axios.get('http://localhost:3001/api/devices'),
            axios.get('http://localhost:3001/api/rentals')
          ]);

          console.log('API responses:', { users: usersRes.data, devices: devicesRes.data, rentals: rentalsRes.data });

          // Check for arrays in the response data structure
          const usersData = Array.isArray(usersRes.data.data) ? usersRes.data.data : 
                           (usersRes.data.data?.users ? usersRes.data.data.users : []);
          
          const devicesData = Array.isArray(devicesRes.data.data) ? devicesRes.data.data :
                             (devicesRes.data.data?.devices ? devicesRes.data.data.devices : []);
          
          const rentalsData = Array.isArray(rentalsRes.data.data) ? rentalsRes.data.data :
                             (rentalsRes.data.data?.rentals ? rentalsRes.data.data.rentals : []);
          
          setAdminStats({
            userCount: usersData.length || 0,
            deviceCount: devicesData.length || 0,
            rentalCount: rentalsData.length || 0,
          });

          console.log('Processed counts:', { 
            users: usersData.length, 
            devices: devicesData.length, 
            rentals: rentalsData.length 
          });
        } else if (user.role === 'client') {
          const [myRentalsRes, availableDevicesRes] = await Promise.all([
            axios.get('http://localhost:3001/api/rentals/me'),
            axios.get('http://localhost:3001/api/devices?status=available')
          ]);

          // Check for arrays in the response data structure
          const myRentalsData = Array.isArray(myRentalsRes.data.data) ? myRentalsRes.data.data : 
                               (myRentalsRes.data.data?.rentals ? myRentalsRes.data.data.rentals : []);
          
          const availableDevicesData = Array.isArray(availableDevicesRes.data.data) ? availableDevicesRes.data.data :
                                      (availableDevicesRes.data.data?.devices ? availableDevicesRes.data.data.devices : []);

          setClientData({
            activeRentals: myRentalsData.length || 0,
            availableDevices: availableDevicesData.length || 0,
          });
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {user?.role === 'admin' && <AdminDashboardContent stats={adminStats} loading={loading}/>}
      {user?.role === 'client' && <ClientDashboardContent clientData={clientData} loading={loading} userName={user.name}/>}
      {!user && <Typography>Please log in.</Typography>}
    </Box>
  );
};

export default Dashboard;
