import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
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
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard title="Total Users" value="2,300" icon={PeopleIcon} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Active Devices" value="1,200" icon={DevicesIcon} />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Active Subscriptions"
            value="850"
            icon={SubscriptionsIcon}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard title="Monthly Revenue" value="$45,000" icon={TrendingUpIcon} />
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Platform Overview
            </Typography>
            <BarChart
              width={1000}
              height={300}
              data={data}
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
              <Bar dataKey="Users" fill="#8884d8" />
              <Bar dataKey="Devices" fill="#82ca9d" />
              <Bar dataKey="Subscriptions" fill="#ffc658" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
