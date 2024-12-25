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

interface Plan {
  type: 'daily' | 'weekly' | 'monthly';
  price: number;
  features: string[];
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

  const handleSubscribe = async (plan: Plan) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleConfirmSubscription = async () => {
    if (!selectedPlan || !user) return;

    setLoading(true);
    setError(null);

    try {
      await axios.post('http://localhost:3001/api/subscriptions', {
        planType: selectedPlan.type,
        amount: selectedPlan.price
      });

      // Close dialog and show success message
      setDialogOpen(false);
      // You might want to show a success notification here
      window.location.reload(); // Refresh to show new subscription
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Choose Your Plan
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Select the plan that best fits your needs
      </Typography>

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.type}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 6
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div" gutterBottom>
                  {plan.type.charAt(0).toUpperCase() + plan.type.slice(1)} Plan
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  ${plan.price}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {plan.type === 'daily' ? 'per day' : plan.type === 'weekly' ? 'per week' : 'per month'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {plan.features.map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 0.5 }}
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleSubscribe(plan)}
                >
                  Subscribe Now
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
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
    </Box>
  );
};

export default SubscriptionPlans;
