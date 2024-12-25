import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import api from '../config/api';

interface Plan {
  type: 'daily' | 'weekly' | 'monthly';
  price: number;
  features: string[];
}

interface Device {
  id: string;
  serialNumber: string;
  specifications?: {
    model?: string;
    manufacturer?: string;
    firmware?: string;
    hardware?: string;
  };
}

const plans: Plan[] = [
  {
    type: 'daily',
    price: 9.99,
    features: [
      '24-hour access',
      'Basic support',
      'Single device',
      'Standard features'
    ]
  },
  {
    type: 'weekly',
    price: 49.99,
    features: [
      '7-day access',
      'Priority support',
      'Up to 3 devices',
      'Advanced features',
      'Usage analytics'
    ]
  },
  {
    type: 'monthly',
    price: 149.99,
    features: [
      '30-day access',
      '24/7 Premium support',
      'Unlimited devices',
      'All features included',
      'Advanced analytics',
      'Custom solutions'
    ]
  }
];

const SubscriptionPlans: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [assignedDevices, setAssignedDevices] = useState<Device[]>([]);

  const handleSubscribe = async (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/subscriptions', {
        planType: selectedPlan.type,
        amount: selectedPlan.price
      });

      if (response.data?.data?.assignedDevices) {
        setAssignedDevices(response.data.data.assignedDevices);
      }
      setDialogOpen(false);
      setSuccessDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    window.location.reload(); // Refresh to show new subscription
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Select the plan that best fits your needs
      </Typography>

      <Grid container spacing={3}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.type}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)} Plan
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${plan.price}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {plan.features.map((feature, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                      • {feature}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)}>
        <DialogTitle>Confirm Subscription</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          <Typography>
            Are you sure you want to subscribe to the {selectedPlan?.type} plan for ${selectedPlan?.price}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSubscription}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={successDialogOpen} onClose={handleSuccessClose}>
        <DialogTitle>Subscription Successful!</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your subscription is now active
            </Typography>
            {assignedDevices.length > 0 ? (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Assigned Devices:
                </Typography>
                {assignedDevices.map((device) => (
                  <Box key={device.id} sx={{ mb: 1 }}>
                    <Typography>
                      • Device {device.serialNumber}
                      {device.specifications?.model && ` - ${device.specifications.model}`}
                    </Typography>
                  </Box>
                ))}
              </>
            ) : (
              <Typography color="warning.main">
                No devices are currently available. Please contact support for assistance.
              </Typography>
            )}
            <Typography sx={{ mt: 2 }}>
              You can manage your devices in the Devices tab.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSuccessClose} variant="contained">
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlans;
