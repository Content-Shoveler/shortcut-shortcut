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
import { buttonVariants, neonSignVariants } from '../utils/animations';

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
          background: `linear-gradient(90deg, transparent, ${alpha(muiTheme.palette.primary.main, 0.7)}, transparent)`,
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
            borderTop: `2px solid ${muiTheme.palette.primary.main}`,
            borderLeft: `2px solid ${muiTheme.palette.primary.main}`,
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
            <Box sx={{ 
              display: 'flex', 
              fontFamily: '"Rajdhani", sans-serif',
              letterSpacing: '0.05em',
              fontWeight: 'bold',
            }}>
              {/* Split the text into individual letters for neon effect */}
              {"SHORTCUT EPIC TEMPLATES".split('').map((letter, index) => (
                <motion.span
                  key={index}
                  initial="initial"
                  animate={["animate", "flicker"]}
                  variants={neonSignVariants}
                  custom={{ i: index, isDarkMode: themeAppearance === 'dark' }}
                  style={{ 
                    display: 'inline-block',
                    fontWeight: 'bold',
                    whiteSpace: 'pre',
                    color: '#FFFFFF !important',
                  }}
                  className="cyber-neon"
                >
                  {letter}
                </motion.span>
              ))}
            </Box>
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 4 }}>
          <Tooltip title="My Templates">
            <MotionButton 
              color="inherit" 
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              disabled={isHomePage}
              sx={{ 
                position: 'relative',
                opacity: isHomePage ? 0.7 : 1,
                border: themeAppearance === 'dark' ? 'none' : `1px solid ${muiTheme.palette.primary.main}`,
                borderRadius: '4px',
                backgroundColor: themeAppearance === 'dark' ? alpha(muiTheme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  borderColor: themeAppearance === 'dark' ? 'transparent' : muiTheme.palette.warning.main,
                  backgroundColor: themeAppearance === 'dark' ? alpha(muiTheme.palette.primary.main, 0.2) : 'transparent',
                  boxShadow: themeAppearance === 'dark' ? `0 0 8px ${alpha(muiTheme.palette.warning.main, 0.5)}` : 'none'
                }
              }}
            >
              My Templates
            </MotionButton>
          </Tooltip>
          
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
                borderRadius: '4px',
                border: themeAppearance === 'dark' ? 'none' : `1px solid ${muiTheme.palette.primary.main}`,
                backgroundColor: themeAppearance === 'dark' ? alpha(muiTheme.palette.primary.main, 0.1) : 'transparent',
                '&:hover': {
                  borderColor: themeAppearance === 'dark' ? 'transparent' : muiTheme.palette.warning.main,
                  backgroundColor: themeAppearance === 'dark' ? alpha(muiTheme.palette.primary.main, 0.2) : 'transparent',
                  boxShadow: themeAppearance === 'dark' ? `0 0 8px ${alpha(muiTheme.palette.warning.main, 0.5)}` : 'none'
                }
              }}
            >
              New Template
            </MotionButton>
          </Tooltip>
        </Box>
        
        {/* Settings button isolated on the right */}
        <Box sx={{ ml: 'auto' }}>
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
              sx={{
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 5,
                  right: 5,
                  width: 10,
                  height: 10,
                  borderBottom: `2px solid ${muiTheme.palette.warning.main}`,
                  borderRight: `2px solid ${muiTheme.palette.warning.main}`,
                },
                '&:hover': {
                  color: themeAppearance === 'dark' ? '#FFFFFF' : muiTheme.palette.secondary.main,
                  boxShadow: themeAppearance === 'dark' 
                    ? `0 0 8px ${alpha(muiTheme.palette.warning.main, 0.5)}` 
                    : `0 0 5px ${alpha(muiTheme.palette.primary.main, 0.3)}`,
                  transform: 'scale(1.05)'
                }
              }}
            >
              <SettingsIcon />
            </MotionIconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
