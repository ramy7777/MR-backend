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
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import api from '../config/api';

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
  lastMaintenance: string | null;
  currentUserId: string | null;
}

interface DeviceDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (device: Partial<Device>) => void;
  device?: Device;
  mode: 'add' | 'edit';
}

const DeviceDialog: React.FC<DeviceDialogProps> = ({ open, onClose, onSubmit, device, mode }) => {
  const [formData, setFormData] = useState<Partial<Device>>({
    serialNumber: '',
    status: 'available',
    condition: 'excellent',
    specifications: {},
    ...device,
  });

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'add' ? 'Add New Device' : 'Edit Device'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Serial Number"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            />
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="rented">Rented</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="retired">Retired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>Condition</InputLabel>
              <Select
                value={formData.condition}
                label="Condition"
                onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
              >
                <MenuItem value="excellent">Excellent</MenuItem>
                <MenuItem value="good">Good</MenuItem>
                <MenuItem value="fair">Fair</MenuItem>
                <MenuItem value="poor">Poor</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Model"
              value={formData.specifications?.model || ''}
              onChange={(e) => setFormData({
                ...formData,
                specifications: { ...formData.specifications, model: e.target.value }
              })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Manufacturer"
              value={formData.specifications?.manufacturer || ''}
              onChange={(e) => setFormData({
                ...formData,
                specifications: { ...formData.specifications, manufacturer: e.target.value }
              })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Firmware Version"
              value={formData.specifications?.firmware || ''}
              onChange={(e) => setFormData({
                ...formData,
                specifications: { ...formData.specifications, firmware: e.target.value }
              })}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Hardware Version"
              value={formData.specifications?.hardware || ''}
              onChange={(e) => setFormData({
                ...formData,
                specifications: { ...formData.specifications, hardware: e.target.value }
              })}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          {mode === 'add' ? 'Add Device' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AdminDevices = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/devices');
      setDevices(response.data.data.devices);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (deviceData: Partial<Device>) => {
    try {
      await api.post('/api/admin/devices', deviceData);
      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add device');
    }
  };

  const handleEditDevice = async (deviceData: Partial<Device>) => {
    try {
      await api.put(`/api/admin/devices/${selectedDevice?.id}`, deviceData);
      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update device');
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await api.delete(`/api/admin/devices/${id}`);
        fetchDevices();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete device');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'rented':
        return 'primary';
      case 'maintenance':
        return 'warning';
      case 'retired':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'success';
      case 'good':
        return 'primary';
      case 'fair':
        return 'warning';
      case 'poor':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredDevices = devices.filter(device =>
    device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.specifications?.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.specifications?.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
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
          Device Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search devices..."
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
          <IconButton onClick={fetchDevices} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogMode('add');
              setSelectedDevice(undefined);
              setDialogOpen(true);
            }}
          >
            Add Device
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Serial Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Condition</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Last Maintenance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDevices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.serialNumber}</TableCell>
                <TableCell>
                  <Chip
                    label={device.status}
                    color={getStatusColor(device.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={device.condition}
                    color={getConditionColor(device.condition) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{device.specifications?.model || '-'}</TableCell>
                <TableCell>{device.specifications?.manufacturer || '-'}</TableCell>
                <TableCell>
                  {device.lastMaintenance
                    ? new Date(device.lastMaintenance).toLocaleDateString()
                    : 'Never'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => {
                      setDialogMode('edit');
                      setSelectedDevice(device);
                      setDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteDevice(device.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeviceDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={dialogMode === 'add' ? handleAddDevice : handleEditDevice}
        device={selectedDevice}
        mode={dialogMode}
      />
    </Box>
  );
};

export default AdminDevices;
