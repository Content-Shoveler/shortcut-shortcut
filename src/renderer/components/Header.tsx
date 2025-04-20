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
        zIndex: 
        1100,
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
          {/* CyberPunk Title with advanced effects */}
          <Box 
            sx={{ 
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pr: 3,
              pl: 1,
            }}
          >
            {/* Background layers */}
            <Box sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              pointerEvents: 'none',
            }}>
              {/* Retro grid plane */}
              <motion.div
                style={{
                  position: 'absolute',
                  width: '150%',
                  height: '150%',
                  top: '-25%',
                  left: '-25%',
                  backgroundImage: `radial-gradient(
                    circle at 50% 50%,
                    ${alpha(muiTheme.palette.primary.dark, 0.1)} 1px,
                    transparent 1px
                  )`,
                  backgroundSize: '10px 10px',
                  perspective: '500px',
                  perspectiveOrigin: 'center',
                  zIndex: -1,
                  opacity: themeAppearance === 'dark' ? 0.5 : 0.2,
                }}
                animate={{
                  rotateX: [0, 15, 0],
                  rotateY: [0, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </Box>

            {/* Main title - primary layer */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [0, -2, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'relative',
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: scrolled ? '1.15rem' : '1.3rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                textAlign: 'center',
                marginBottom: '-0.8rem',
                zIndex: 3,
                padding: '0.25rem 0.5rem',
                overflow: 'visible',
              }}
            >
              <motion.div
                initial={{ filter: 'none' }}
                animate={{ 
                  filter: [
                    'drop-shadow(0 0 2px rgba(10, 206, 130, 0.5))', 
                    'drop-shadow(0 0 8px rgba(9, 165, 106, 0.7))', 
                    'drop-shadow(0 0 2px rgba(10, 206, 130, 0.5))'
                  ],
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ position: 'relative' }}
              >
                {/* Main text with clipping */}
                <motion.div
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 92% 100%, 90% 90%, 0% 90%)',
                  }}
                >
                  {/* Glitch segments */}
                  <motion.div
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      color: themeAppearance === 'dark' ? '#0ACE82' : '#2D5F5D',
                      textShadow: themeAppearance === 'dark' 
                        ? '0 0 5px #0ACE82, 0 0 10px #09A56A' 
                        : '0 0 3px #2D5F5D, 0 0 5px #2D5F5D',
                      left: 0,
                      top: 0,
                      opacity: 0,
                    }}
                    animate={{
                      left: ['-5%', '2%', '-2%', '0%', '-1%', '0%'],
                      opacity: [0, 0.8, 0, 0.9, 0],
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 5 + Math.random() * 10,
                      times: [0, 0.2, 0.3, 0.4, 0.5, 1],
                    }}
                  >
                    SHORTCUT
                  </motion.div>
                  
                  {/* Main text */}
                  <motion.span
                    style={{
                      display: 'block',
                      color: themeAppearance === 'dark' ? '#0ACE82' : '#2D5F5D',
                      textShadow: themeAppearance === 'dark' 
                        ? '0 0 5px rgba(10, 206, 130, 0.7), 0 0 10px rgba(9, 165, 106, 0.5), 0 0 15px rgba(7, 140, 90, 0.3)' 
                        : '0 0 3px rgba(45, 95, 93, 0.5), 0 0 6px rgba(45, 95, 93, 0.3)',
                      zIndex: 2,
                    }}
                  >
                    SHORTCUT
                  </motion.span>
                  
                  {/* Highlight scanline */}
                  <motion.span
                    style={{
                      position: 'absolute',
                      width: '150%',
                      height: '3px',
                      background: themeAppearance === 'dark' 
                        ? 'linear-gradient(90deg, transparent, rgba(10, 206, 130, 0.7), transparent)' 
                        : 'linear-gradient(90deg, transparent, rgba(45, 95, 93, 0.7), transparent)',
                      left: '-25%',
                      opacity: 0,
                    }}
                    animate={{
                      top: ['0%', '100%'],
                      opacity: [0, 0.9, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatDelay: 3,
                      ease: "easeInOut",
                      times: [0, 0.5, 1],
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
            
            {/* Subtitle/badge with NASA-inspired look */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                position: 'relative',
                background: themeAppearance === 'dark' 
                  ? 'linear-gradient(90deg, rgba(27,32,43,0.9) 0%, rgba(32,42,58,0.9) 100%)' 
                  : 'linear-gradient(90deg, rgba(232,240,248,0.9) 0%, rgba(219,227,242,0.9) 100%)',
                border: `1px solid ${themeAppearance === 'dark' ? '#304c75' : '#b0c2e0'}`,
                padding: '0.1rem 0.6rem',
                borderRadius: '2px',
                fontSize: '0.65rem',
                letterSpacing: '0.15em',
                fontFamily: fonts.mono,
                color: themeAppearance === 'dark' ? '#e2ebff' : '#0d3278',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
                marginTop: '0.15rem',
                width: 'fit-content',
                clipPath: scrolled 
                  ? 'polygon(0% 0%, 100% 0%, 100% 100%, 90% 100%, 85% 70%, 0% 70%)'  
                  : 'polygon(0% 0%, 100% 0%, 100% 100%, 80% 100%, 75% 70%, 0% 70%)',
                transform: 'translateX(8px)',
              }}
            >
              <motion.span
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                TEMPLATE ENGINE
              </motion.span>
              
              {/* Animated data light */}
              <motion.div
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: themeAppearance === 'dark' ? '#5d8aff' : '#0055cc',
                  marginLeft: '6px',
                }}
                animate={{
                  opacity: [1, 0.3, 1],
                  boxShadow: [
                    themeAppearance === 'dark' ? '0 0 2px #5d8aff' : '0 0 1px #0055cc', 
                    themeAppearance === 'dark' ? '0 0 5px #5d8aff' : '0 0 3px #0055cc', 
                    themeAppearance === 'dark' ? '0 0 2px #5d8aff' : '0 0 1px #0055cc'
                  ],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
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
