import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  DevicesOther as DeviceIcon,
  AccessTime as TimeIcon,
  Payment as PaymentIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import axiosInstance from '../utils/axios';

const StatCard = ({ title, value, icon: Icon, subtext }: { title: string; value: string; icon: any; subtext?: string }) => (
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
      {subtext || 'Current Status'}
    </Typography>
  </Paper>
);

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get('/dashboard/user');
        console.log('Dashboard response:', response.data); 
        setDashboardData(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px" flexDirection="column">
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </Box>
    );
  }

  const formatUsageData = (usageHistory: any[]) => {
    return usageHistory?.map(item => ({
      date: new Date(item.date).toLocaleDateString(),
      usage: item.usage
    })) || [];
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Subscription Status */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Subscription Plan"
            value={dashboardData?.subscription?.plan || 'No Plan'}
            icon={PaymentIcon}
            subtext={`Valid until ${new Date(dashboardData?.subscription?.endDate).toLocaleDateString()}`}
          />
        </Grid>

        {/* Active Devices */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Your Devices"
            value={`${dashboardData?.devices?.active || 0} Active`}
            icon={DeviceIcon}
            subtext={`of ${dashboardData?.subscription?.features?.maxDevices || 0} allowed`}
          />
        </Grid>

        {/* Usage */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="Usage Hours"
            value={`${Math.round(dashboardData?.sessions?.totalHours || 0)}h`}
            icon={TimeIcon}
            subtext="This billing period"
          />
        </Grid>

        {/* Performance */}
        <Grid item xs={12} md={3}>
          <StatCard
            title="System Health"
            value={`${dashboardData?.devices?.list?.[0]?.performance || 0}%`}
            icon={SpeedIcon}
            subtext="Average performance"
          />
        </Grid>

        {/* Usage Graph */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Usage History
            </Typography>
            <LineChart
              width={1000}
              height={300}
              data={formatUsageData(dashboardData?.subscription?.usageHistory)}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" color="primary">
                Add Device
              </Button>
              <Button variant="outlined" color="primary">
                View Billing
              </Button>
              <Button variant="outlined" color="primary">
                Get Support
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <List>
              {dashboardData?.sessions?.recent?.slice(0, 3).map((session: any, index: number) => (
                <React.Fragment key={session.id}>
                  <ListItem>
                    <ListItemText
                      primary={`Session on ${new Date(session.startTime).toLocaleDateString()}`}
                      secondary={`Duration: ${session.duration?.toFixed(1) || 0} hours`}
                    />
                  </ListItem>
                  {index < 2 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerDashboard;
