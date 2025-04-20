import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  Box,
  alpha,
  useTheme as useMuiTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTheme } from '../store/AppProviders';
import { motion } from 'framer-motion';
import { 
  dataFlowVariants, 
  buttonVariants 
} from '../utils/animations/cyberpunk';
import { CyberButton, CyberIcon, CyberBase, CyberMotionBase } from './cyberpunk';
import { fonts } from '../theme/cyberpunkTokens';
import { getCornerClipPath, getCornerAccents } from '../utils/cyberpunkUtils';

// Create motion versions of MUI components
const MotionTypography = motion(Typography);

// This will be used to detect direction of scroll
const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState('up');
  const [lastYPos, setLastYPos] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const yPos = window.scrollY;
      const isScrollingUp = yPos < lastYPos;
      
      setScrollDirection(isScrollingUp ? 'up' : 'down');
      setLastYPos(yPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastYPos]);

  return scrollDirection;
};

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeAppearance } = useTheme();
  const muiTheme = useMuiTheme();
  const [scrolled, setScrolled] = useState(false);
  
  const isHomePage = location.pathname === '/';
  const isSettingsPage = location.pathname === '/settings';
  const isEditorPage = location.pathname.includes('/editor');
  const isApplyPage = location.pathname.includes('/apply');

  // Track scroll position to apply effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get scroll direction to adjust header visibility
  const scrollDirection = useScrollDirection();
  
  return (
    <AppBar 
      position="fixed"
      elevation={scrolled ? 4 : 0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? 2 : 0,
        background: scrolled 
          ? `linear-gradient(135deg, ${alpha(muiTheme.palette.background.paper, 0.8)} 0%, ${alpha(muiTheme.palette.background.paper, 0.95)} 100%)`
          : 'transparent',
        borderBottom: scrolled ? 'none' : `1px solid ${alpha(muiTheme.palette.primary.main, 0.1)}`,
        transition: 'all 0.3s ease',
        // Hide header when scrolling down, show when scrolling up
        transform: scrollDirection === 'down' && scrolled && !isSettingsPage ? 'translateY(-100%)' : 'translateY(0)',
      }}
    >
      <CyberBase
        component={Toolbar}
        cornerClip={false}
        dataFlow={scrolled}
        dataFlowDirection="rtl"
        accentColor={muiTheme.palette.primary.main}
        scanlineEffect={scrolled && themeAppearance === 'dark'}
        sx={{ 
          position: 'relative',
          '&::after': !scrolled ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '25%',
            width: '50%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${alpha(muiTheme.palette.primary.main, 0.7)}, transparent)`,
            zIndex: 1,
          } : {}
        }}
      >
        {/* Logo & Title Section */}
        <CyberMotionBase 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          cornerClip={scrolled ? 'sm' : 'md'}
          accentColor={muiTheme.palette.secondary.main}
          sx={{ 
            position: 'relative', 
            display: 'flex', 
            alignItems: 'center',
            pr: 3,
            pl: 2,
            py: 1,
            background: alpha(muiTheme.palette.background.paper, scrolled ? 0.3 : 0),
          }}
        >
          <Box 
            sx={{ 
              display: 'flex', 
              fontFamily: fonts.display,
              letterSpacing: '0.08em',
              fontWeight: 'bold',
            }}
          >
            {/* Split the text into individual letters for neon effect */}
            {"SHORTCUT SHORTCUT".split('').map((letter, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 1 }}
                animate={{ 
                  opacity: [1, 0.85 + Math.random() * 0.15, 1, 0.9 + Math.random() * 0.1, 1],
                  color: themeAppearance === 'dark' ? '#00FFFF' : '#0088aa',
                  textShadow: themeAppearance === 'dark' 
                    ? '0 0 5px rgba(0, 255, 255, 0.7), 0 0 10px rgba(0, 255, 255, 0.5), 0 0 15px rgba(0, 255, 255, 0.3)'
                    : '0 0 3px rgba(0, 136, 170, 0.5), 0 0 6px rgba(0, 136, 170, 0.3)',
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2,
                  delay: index * 0.1,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  times: [0, 0.2, 0.3, 0.45, 1],
                }}
                style={{ 
                  display: 'inline-block',
                  fontWeight: 'bold',
                  whiteSpace: 'pre',
                  fontSize: scrolled ? '1.1rem' : '1.25rem',
                  transition: 'font-size 0.3s ease',
                }}
                className="cyber-neon"
              >
                {letter}
              </motion.span>
            ))}
          </Box>
        </CyberMotionBase>
        
        {/* Navigation Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'center', 
            ml: 4,
            transition: 'all 0.3s ease',
          }}
        >
          <CyberMotionBase
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tooltip title="My Templates">
              <CyberButton 
                color="inherit" 
                startIcon={<CyberIcon icon={HomeIcon} size={20} />}
                onClick={() => navigate('/')}
                disabled={isHomePage}
                scanlineEffect={themeAppearance === 'dark'}
                cornerClip={true}
                glowIntensity={isHomePage ? 0.7 : 0.3}
                accentColor={isHomePage ? muiTheme.palette.primary.main : undefined}
                sx={{ 
                  opacity: isHomePage ? 1 : 0.9,
                  transition: 'all 0.3s ease',
                }}
              >
                My Templates
              </CyberButton>
            </Tooltip>
          </CyberMotionBase>
          
          <CyberMotionBase
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tooltip title="Create New Template">
              <CyberButton 
                color="inherit" 
                startIcon={<CyberIcon icon={AddIcon} size={20} />}
                onClick={() => navigate('/editor')}
                scanlineEffect={themeAppearance === 'dark'}
                cornerClip={true}
                glowIntensity={isEditorPage ? 0.7 : 0.3}
                accentColor={isEditorPage ? muiTheme.palette.secondary.main : undefined}
                sx={{ 
                  opacity: isEditorPage ? 1 : 0.9,
                  transition: 'all 0.3s ease',
                }}
              >
                New Template
              </CyberButton>
            </Tooltip>
          </CyberMotionBase>
        </Box>
        
        {/* Settings button isolated on the right */}
        <Box sx={{ ml: 'auto' }}>
          <CyberMotionBase
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Tooltip title="Settings">
              <CyberButton
                onClick={() => navigate('/settings')}
                cornerClip={true}
                scanlineEffect={themeAppearance === 'dark'}
                glowIntensity={isSettingsPage ? 0.7 : 0.3}
                accentColor={isSettingsPage ? muiTheme.palette.warning.main : undefined}
                sx={{
                  minWidth: 'auto',
                  p: 1,
                }}
              >
                <CyberIcon 
                  icon={SettingsIcon} 
                  size={24} 
                  rotate={isSettingsPage}
                  pulse={isSettingsPage}
                  glowIntensity={isSettingsPage ? 0.7 : 0.3}
                />
              </CyberButton>
            </Tooltip>
          </CyberMotionBase>
        </Box>
      </CyberBase>
    </AppBar>
  );
};

export default Header;
