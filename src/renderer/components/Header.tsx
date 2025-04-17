import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tooltip,
  IconButton,
  alpha,
  useTheme as useMuiTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '../store/AppProviders';
import { motion } from 'framer-motion';
import { buttonVariants, glitchTextVariants } from '../utils/animations';

// Create motion versions of MUI components
const MotionButton = motion(Button);
const MotionIconButton = motion(IconButton);
const MotionTypography = motion(Typography);

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeAppearance } = useTheme();
  const muiTheme = useMuiTheme();
  
  const isHomePage = location.pathname === '/';

  return (
    <AppBar 
      position="static" 
      sx={{ 
        clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)',
        borderBottom: 'none',
      }}
    >
      <Toolbar sx={{ 
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '25%',
          width: '50%',
          height: '2px',
          background: `linear-gradient(90deg, transparent, ${alpha(muiTheme.palette.secondary.main, 0.7)}, transparent)`,
        }
      }}>
        <Box sx={{ 
          position: 'relative', 
          display: 'flex', 
          alignItems: 'center',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -5,
            left: -10,
            width: 20,
            height: 20,
            borderTop: `2px solid ${muiTheme.palette.secondary.main}`,
            borderLeft: `2px solid ${muiTheme.palette.secondary.main}`,
          }
        }}>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              paddingLeft: 1.5,
              position: 'relative',
            }}
          >
            <motion.span
              initial="initial"
              animate="animate"
              variants={glitchTextVariants}
              style={{ display: 'inline-block' }}
            >
              SHORTCUT EPIC{' '}
              <Box
                component="span"
                sx={{
                  color: muiTheme.palette.secondary.main,
                  textShadow: themeAppearance === 'dark' ? '0 0 8px rgba(0, 255, 255, 0.5)' : 'none'
                }}
              >
                TEMPLATES
              </Box>
            </motion.span>
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Settings">
            <MotionIconButton 
              color="inherit" 
              onClick={() => navigate('/settings')} 
              size="large"
              whileHover={{ 
                rotate: 90,
                scale: 1.1, 
                transition: { duration: 0.3 } 
              }}
              whileTap={{ scale: 0.95 }}
            >
              <SettingsIcon />
            </MotionIconButton>
          </Tooltip>
          
          {!isHomePage && (
            <Tooltip title="Back to Templates">
              <MotionButton 
                color="inherit" 
                startIcon={<HomeIcon />}
                onClick={() => navigate('/')}
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                sx={{ 
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 3,
                    left: '10%',
                    width: '80%',
                    height: '1px',
                    background: `linear-gradient(90deg, transparent, ${alpha(muiTheme.palette.common.white, 0.5)}, transparent)`,
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  },
                  '&:hover::after': {
                    opacity: 1,
                  }
                }}
              >
                Templates
              </MotionButton>
            </Tooltip>
          )}
          
          <Tooltip title="Create New Template">
            <MotionButton 
              color="inherit" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/editor')}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              sx={{ 
                position: 'relative',
                clipPath: 'polygon(0 0, 100% 0, 100% 70%, 95% 100%, 0 100%)',
                pr: 2,
                backgroundColor: alpha(muiTheme.palette.secondary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(muiTheme.palette.secondary.main, 0.2),
                }
              }}
            >
              New Template
            </MotionButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
