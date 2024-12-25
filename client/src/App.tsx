import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Dashboard from './components/Dashboard';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Users from './components/Users';
import Devices from './components/Devices';
import Subscriptions from './components/Subscriptions';
import Login from './components/Login';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [open, setOpen] = React.useState(true);

  const toggleDrawer = () => {
    setOpen(!open);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Box sx={{ display: 'flex' }}>
                    <Navbar open={open} toggleDrawer={toggleDrawer} />
                    <Sidebar open={open} />
                    <Box
                      component="main"
                      sx={{
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                        padding: 3,
                        marginTop: 8,
                      }}
                    >
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route 
                          path="/users" 
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <Users />
                            </ProtectedRoute>
                          } 
                        />
                        <Route path="/devices" element={<Devices />} />
                        <Route path="/subscriptions" element={<Subscriptions />} />
                      </Routes>
                    </Box>
                  </Box>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
