import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import axios from 'axios';

interface Subscription {
  id: string;
  planType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
}

const SubscriptionHistory: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/subscriptions/my-subscriptions');
      setSubscriptions(response.data.data.subscriptions || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/api/subscriptions/${id}/cancel`);
      fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription');
    }
  };

  const handleRenew = async (id: string) => {
    try {
      await axios.post(`http://localhost:3001/api/subscriptions/${id}/renew`);
      fetchSubscriptions(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to renew subscription');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'cancelled':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Subscription History
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)}
                </TableCell>
                <TableCell>{new Date(subscription.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(subscription.endDate).toLocaleDateString()}</TableCell>
                <TableCell>${subscription.amount}</TableCell>
                <TableCell>
                  <Chip
                    label={subscription.status}
                    color={getStatusColor(subscription.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={subscription.paymentStatus}
                    color={getPaymentStatusColor(subscription.paymentStatus) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {subscription.status === 'active' && (
                    <Button
                      size="small"
                      color="warning"
                      onClick={() => handleCancel(subscription.id)}
                    >
                      Cancel
                    </Button>
                  )}
                  {subscription.status === 'expired' && (
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleRenew(subscription.id)}
                    >
                      Renew
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default SubscriptionHistory;
