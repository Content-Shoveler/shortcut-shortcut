import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  useTheme, 
  alpha,
  Container,
  keyframes
} from '@mui/material';
import { motion } from 'framer-motion';
import { CyberButton } from '../components/cyberpunk';

// Animations
const glitchAnim = keyframes`
  0% {
    clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%);
    transform: translate(-10px, -3px);
    opacity: 0.1;
  }
  2% {
    clip-path: polygon(0 78%, 100% 78%, 100% 100%, 0 100%);
    transform: translate(10px, 3px);
    opacity: 0.5;
  }
  4% {
    clip-path: polygon(0 44%, 100% 44%, 100% 54%, 0 54%);
    transform: translate(3px, 1px);
    opacity: 0.8;
  }
  5% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translate(0);
    opacity: 1;
  }
  55% {
    clip-path: polygon(0 60%, 100% 60%, 100% 65%, 0 65%);
    transform: translate(-10px, 8px);
    opacity: 0.3;
  }
  57% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translate(0);
    opacity: 1;
  }
  85% {
    clip-path: polygon(0 50%, 100% 50%, 100% 52%, 0 52%);
    transform: translate(-3px, -5px);
    opacity: 0.7;
  }
  87% {
    clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
    transform: translate(0);
    opacity: 1;
  }
`;

const scanLineAnim = keyframes`
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
`;

const pulseAnim = keyframes`
  0% {
    text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff;
    opacity: 0.8;
  }
  50% {
    text-shadow: 0 0 20px #ff00ff, 0 0 30px #ff00ff;
    opacity: 1;
  }
  100% {
    text-shadow: 0 0 5px #00ffff, 0 0 10px #00ffff;
    opacity: 0.8;
  }
`;

const NotFound: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [errorCode, setErrorCode] = useState<string>('404');
  
  // Simulate glitching error code
  useEffect(() => {
    const glitchIntervals = [
      setInterval(() => {
        setErrorCode('4Ø4');
        setTimeout(() => setErrorCode('404'), 200);
      }, 3000),
      setInterval(() => {
        setErrorCode('4×4');
        setTimeout(() => setErrorCode('404'), 150);
      }, 7000)
    ];
    
    return () => {
      glitchIntervals.forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        textAlign: 'center',
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center' 
      }}
    >
      {/* Background circuit pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.2,
          zIndex: 0,
          background: `repeating-linear-gradient(
            to right,
            ${alpha(theme.palette.secondary.main, 0.1)} 0px,
            ${alpha(theme.palette.secondary.main, 0.1)} 1px,
            transparent 1px,
            transparent 10px
          ),
          repeating-linear-gradient(
            to bottom,
            ${alpha(theme.palette.secondary.main, 0.1)} 0px,
            ${alpha(theme.palette.secondary.main, 0.1)} 1px,
            transparent 1px,
            transparent 10px
          )`,
          pointerEvents: 'none',
        }}
      />

      {/* Scan line effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 10,
          overflow: 'hidden',
          pointerEvents: 'none',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(to bottom, 
              transparent, 
              ${alpha(theme.palette.secondary.main, 0.5)}, 
              transparent)`,
            animation: `${scanLineAnim} 8s linear infinite`,
          }
        }}
      />
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ zIndex: 1, position: 'relative' }}
      >
        <Typography 
          variant="h1" 
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: { xs: '6rem', md: '12rem' },
            fontWeight: 700,
            color: theme.palette.secondary.main,
            mt: 2,
            mb: 2,
            position: 'relative',
            display: 'inline-block',
            animation: `${pulseAnim} 4s infinite`,
            '&::before': {
              content: `"${errorCode}"`,
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              color: theme.palette.secondary.light,
              animation: `${glitchAnim} 10s infinite`,
              textShadow: `3px 3px 0 ${theme.palette.primary.main}`,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            },
            '&::after': {
              content: `"${errorCode}"`,
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              color: theme.palette.error.main,
              animation: `${glitchAnim} 15s infinite reverse`,
              textShadow: `-3px -3px 0 ${theme.palette.secondary.dark}`,
              clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
            }
          }}
        >
          {errorCode}
        </Typography>
        
        <Typography 
          variant="h4" 
          sx={{
            fontFamily: '"Share Tech Mono", monospace',
            color: theme.palette.primary.main,
            mb: 3,
            textShadow: `0 0 8px ${theme.palette.primary.main}`,
            '& > span': {
              color: theme.palette.error.main,
              animation: `${pulseAnim} 2s infinite`,
            }
          }}
        >
          SYS<span>:/ERROR</span>/PAGE_NOT_FOUND
        </Typography>
        
        <Box 
          sx={{ 
            my: 4,
            p: 3, 
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            borderLeft: `4px solid ${theme.palette.secondary.main}`,
            background: alpha(theme.palette.secondary.main, 0.05),
            textAlign: 'left',
            position: 'relative',
            '&::before': {
              content: '"TERMINAL_OUTPUT"',
              position: 'absolute',
              top: -10,
              left: 10,
              backgroundColor: theme.palette.background.paper,
              padding: '0 5px',
              fontSize: '0.8rem',
              color: theme.palette.secondary.main,
            }
          }}
        >
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              fontFamily: '"Share Tech Mono", monospace',
              color: theme.palette.text.primary,
              fontSize: '1rem',
              lineHeight: 1.8
            }}
          >
            <span style={{ color: theme.palette.primary.main }}>{'>'}</span> Scanning neural network connections...<br />
            <span style={{ color: theme.palette.primary.main }}>{'>'}</span> Attempting to locate requested cyberspace node...<br />
            <span style={{ color: theme.palette.primary.main }}>{'>'}</span> <span style={{ color: theme.palette.error.main }}>ERROR:</span> Neural path disconnected.<br />
            <span style={{ color: theme.palette.primary.main }}>{'>'}</span> Requested digital construct does not exist.<br />
            <span style={{ color: theme.palette.primary.main }}>{'>'}</span> <span style={{ color: theme.palette.warning.main }}>SUGGEST:</span> Return to recognized network node.
          </Typography>
        </Box>
        
        <CyberButton 
          variant="contained" 
          color="secondary"
          onClick={() => navigate('/templates')}
          sx={{ 
            mt: 4,
            fontFamily: '"Share Tech Mono", monospace',
            fontSize: '1.1rem' 
          }}
        >
          &lt; RETURN TO MAINFRAME &gt;
        </CyberButton>
      </motion.div>
    </Container>
  );
};

export default NotFound;
