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
  Chip,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import axios from 'axios';

interface Subscription {
  id: string;
  planType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount: number;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

const AdminSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/admin/subscriptions');
      setSubscriptions(response.data.data.subscriptions);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async (id: string, status: 'paid' | 'failed') => {
    try {
      await axios.patch(`http://localhost:3001/api/subscriptions/${id}/payment-status`, { status });
      fetchSubscriptions(); // Refresh the list
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update payment status');
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

  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">
          All Subscriptions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={fetchSubscriptions} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
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
            {filteredSubscriptions.map((subscription) => (
              <TableRow key={subscription.id}>
                <TableCell>
                  <Typography variant="body2">{subscription.user.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {subscription.user.email}
                  </Typography>
                </TableCell>
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
                  {subscription.paymentStatus === 'pending' && (
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedSubscription(subscription);
                        setDialogOpen(true);
                      }}
                    >
                      Update Payment
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Update Payment Status</DialogTitle>
        <DialogContent>
          <Typography>
            Update payment status for subscription of {selectedSubscription?.user.name}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => selectedSubscription && handleUpdatePaymentStatus(selectedSubscription.id, 'failed')}
            color="error"
          >
            Mark as Failed
          </Button>
          <Button
            onClick={() => selectedSubscription && handleUpdatePaymentStatus(selectedSubscription.id, 'paid')}
            color="success"
          >
            Mark as Paid
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSubscriptions;
