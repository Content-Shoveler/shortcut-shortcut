import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isHomePage = location.pathname === '/';
  
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Shortcut Epic Templates
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isHomePage && (
            <Tooltip title="Back to Templates">
              <Button 
                color="inherit" 
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
              >
                Templates
              </Button>
            </Tooltip>
          )}
          
          <Tooltip title="Create New Template">
            <Button 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/editor')}
            >
              New Template
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
