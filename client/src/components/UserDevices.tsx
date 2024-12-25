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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from '@mui/material';
import axios from 'axios';

interface Device {
  id: string;
  serialNumber: string;
  status: 'available' | 'rented' | 'maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  specifications: {
    model?: string;
    manufacturer?: string;
    firmware?: string;
    hardware?: string;
  };
}

interface DeviceDetailsProps {
  device: Device;
  open: boolean;
  onClose: () => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Device Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Serial Number
            </Typography>
            <Typography variant="body1">{device.serialNumber}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={device.status}
              color={
                device.status === 'available' ? 'success' :
                device.status === 'rented' ? 'primary' :
                device.status === 'maintenance' ? 'warning' : 'error'
              }
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Model
            </Typography>
            <Typography variant="body1">
              {device.specifications?.model || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Manufacturer
            </Typography>
            <Typography variant="body1">
              {device.specifications?.manufacturer || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Firmware Version
            </Typography>
            <Typography variant="body1">
              {device.specifications?.firmware || '-'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Hardware Version
            </Typography>
            <Typography variant="body1">
              {device.specifications?.hardware || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Condition
            </Typography>
            <Chip
              label={device.condition}
              color={
                device.condition === 'excellent' ? 'success' :
                device.condition === 'good' ? 'primary' :
                device.condition === 'fair' ? 'warning' : 'error'
              }
              size="small"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {device.status === 'available' && (
          <Button variant="contained" color="primary">
            Request Rental
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

const UserDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3001/api/devices');
      setDevices(response.data.data.devices);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (device: Device) => {
    setSelectedDevice(device);
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
        Available Devices
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.serialNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={device.status}
                    color={
                      device.status === 'available' ? 'success' :
                      device.status === 'rented' ? 'primary' :
                      device.status === 'maintenance' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{device.specifications?.model || '-'}</TableCell>
                <TableCell>{device.specifications?.manufacturer || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={device.condition}
                    color={
                      device.condition === 'excellent' ? 'success' :
                      device.condition === 'good' ? 'primary' :
                      device.condition === 'fair' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handleViewDetails(device)}
                  >
                    View Details
                  </Button>
                  {device.status === 'available' && (
                    <Button
                      size="small"
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      Request
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedDevice && (
        <DeviceDetails
          device={selectedDevice}
          open={Boolean(selectedDevice)}
          onClose={() => setSelectedDevice(null)}
        />
      )}
    </Box>
  );
};

export default UserDevices;
