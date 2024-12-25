import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import SubscriptionPlans from './SubscriptionPlans';
import SubscriptionHistory from './SubscriptionHistory';
import AdminSubscriptions from './AdminSubscriptions';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`subscription-tabpanel-${index}`}
      aria-labelledby={`subscription-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Subscriptions = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const adminTabs = [
    <Tab key="all" label="All Subscriptions" />,
    <Tab key="plans" label="Available Plans" />
  ];

  const userTabs = [
    <Tab key="plans" label="Available Plans" />,
    <Tab key="my" label="My Subscriptions" />
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" sx={{ p: 3, pb: 0 }}>
        Subscriptions Management
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="subscription tabs"
        >
          {isAdmin ? adminTabs : userTabs}
        </Tabs>
      </Box>

      {isAdmin ? (
        <>
          <TabPanel value={tabValue} index={0}>
            <AdminSubscriptions />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SubscriptionPlans />
          </TabPanel>
        </>
      ) : (
        <>
          <TabPanel value={tabValue} index={0}>
            <SubscriptionPlans />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <SubscriptionHistory />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default Subscriptions;
