import React from 'react';
import { Switch, SwitchProps, Box, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

// Create a motion component for animations
const MotionBox = motion(Box);

interface CyberSwitchProps extends Omit<SwitchProps, 'css'> {
  glowIntensity?: number;
  accentColor?: string;
  scanlineEffect?: boolean;
}

/**
 * Cyberpunk-themed switch component
 */
const CyberSwitch: React.FC<CyberSwitchProps> = ({
  glowIntensity = 0.5,
  accentColor,
  scanlineEffect = false,
  sx,
  ...switchProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const switchAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${5 * glowIntensity}px ${alpha(switchAccentColor, 0.7)}`
    : 'none';

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Switch
        {...switchProps}
        sx={{
          width: 42, // Reduced from 58px
          height: 22, // Reduced from 34px
          padding: 0,
          '& .MuiSwitch-switchBase': {
            padding: 0,
            margin: '1px',
            transitionDuration: '300ms',
            '&.Mui-checked': {
              transform: 'translateX(20px)', // Adjusted for new width
              color: '#fff',
              '& + .MuiSwitch-track': {
                backgroundColor: theme.palette.mode === 'dark' ? switchAccentColor : alpha(switchAccentColor, 0.8),
                opacity: 1,
                border: 0,
                backgroundImage: `linear-gradient(45deg, ${alpha(switchAccentColor, 0.6)} 25%, transparent 25%, transparent 50%, ${alpha(switchAccentColor, 0.6)} 50%, ${alpha(switchAccentColor, 0.6)} 75%, transparent 75%, transparent)`,
                backgroundSize: '8px 8px',
              },
              '&.Mui-disabled + .MuiSwitch-track': {
                opacity: 0.5,
              },
            },
            '&.Mui-focusVisible .MuiSwitch-thumb': {
              color: switchAccentColor,
              border: `6px solid ${theme.palette.common.white}`,
            },
            '&.Mui-disabled .MuiSwitch-thumb': {
              color: theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[600],
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
            },
          },
          '& .MuiSwitch-thumb': {
            boxSizing: 'border-box',
            width: 20, // Reduced from 30px
            height: 20, // Reduced from 30px
            transition: theme.transitions.create(['transform'], {
              duration: '0.3s',
              easing: theme.transitions.easing.sharp,
            }),
            '&::before': {
              content: "''",
              position: 'absolute',
              width: '100%',
              height: '100%',
              left: 0,
              top: 0,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.3,
            },
          },
          '& .MuiSwitch-track': {
            borderRadius: 34 / 2,
            backgroundColor: theme.palette.mode === 'light' ? alpha(theme.palette.primary.main, 0.4) : alpha(theme.palette.primary.main, 0.2),
            opacity: 1,
            transition: theme.transitions.create(['background-color'], {
              duration: 500,
            }),
            boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.2)',
            border: `1px solid ${alpha(switchAccentColor, 0.3)}`,
            clipPath: 'polygon(0 25%, 5% 0, 95% 0, 100% 25%, 100% 75%, 95% 100%, 5% 100%, 0 75%)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              opacity: 0.1,
              backgroundImage: `linear-gradient(90deg, ${alpha(switchAccentColor, 0.2)} 1px, transparent 1px)`,
              backgroundSize: '2px 100%',
              zIndex: 1,
            },
          },
          '&:hover .MuiSwitch-track': {
            boxShadow: glowEffect,
            borderColor: alpha(switchAccentColor, 0.5),
          },
          
          // Override with any provided sx props
          ...sx
        }}
      />
      
      {/* Optional scanline effect */}
      {scanlineEffect && switchProps.checked && (
        <MotionBox
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0.1,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              ${theme.palette.text.primary},
              ${theme.palette.text.primary} 1px,
              transparent 1px,
              transparent 2px
            )`,
            backgroundSize: '100% 2px',
            zIndex: 1,
            borderRadius: 34 / 2,
          }}
          animate={{
            backgroundPosition: ['0px 0px', '0px -10px'],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </Box>
  );
};

export default CyberSwitch;
