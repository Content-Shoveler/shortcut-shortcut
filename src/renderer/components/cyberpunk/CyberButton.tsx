import React from 'react';
import { Button, ButtonProps, alpha, useTheme, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { buttonVariants } from '../../utils/animations';

// Create a motion component
const MotionBox = motion(Box);

interface CyberButtonProps extends Omit<ButtonProps, 'css'> {
  glowIntensity?: number;
  cornerClip?: boolean;
  scanlineEffect?: boolean;
  accentColor?: string;
}

/**
 * Cyberpunk-themed button component with animation effects
 */
const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  glowIntensity = 0.5,
  cornerClip = true,
  scanlineEffect = false,
  accentColor,
  sx,
  ...buttonProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const buttonAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${8 * glowIntensity}px ${alpha(buttonAccentColor, 0.7)}`
    : 'none';
  
  // Calculate clip path for corner-clipped style
  const clipPath = cornerClip 
    ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
    : undefined;

  return (
    <Button
      {...buttonProps}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: cornerClip ? 0 : 1,
        clipPath: clipPath,
        textTransform: 'none',
        fontSize: '0.9rem',
        letterSpacing: '0.05em',
        padding: theme.spacing(1, 2),
        color: theme.palette.mode === 'dark' ? '#E0FFFF' : '#103037',
        
        // Custom border effect
        border: `1px solid ${alpha(buttonAccentColor, 0.5)}`,
        
        // Before pseudo-element for corner accents
        '&::before': cornerClip ? {
          content: '""',
          position: 'absolute',
          width: '7px',
          height: '7px',
          top: '0',
          right: '0',
          borderTop: `2px solid ${buttonAccentColor}`,
          borderRight: `2px solid ${buttonAccentColor}`,
        } : {},
        
        // After pseudo-element for corner accents
        '&::after': cornerClip ? {
          content: '""',
          position: 'absolute',
          width: '7px',
          height: '7px',
          bottom: '0',
          left: '0',
          borderBottom: `2px solid ${buttonAccentColor}`,
          borderLeft: `2px solid ${buttonAccentColor}`,
        } : {},
        
        // Hover effects
        '&:hover': {
          backgroundColor: alpha(buttonAccentColor, 0.1),
          boxShadow: glowEffect,
          '&::before, &::after': {
            borderColor: buttonAccentColor,
          }
        },
        
        // Override any provided sx props
        ...sx
      }}
    >
      {/* Button content */}
      <MotionBox
        variants={buttonVariants}
        initial="rest"
        whileHover="hover"
        whileTap="tap"
        sx={{ 
          display: 'flex',
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%' 
        }}
      >
        {children}
      </MotionBox>
      
      {/* Optional scanline effect */}
      {scanlineEffect && (
        <MotionBox
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            opacity: 0.05,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              ${theme.palette.text.primary},
              ${theme.palette.text.primary} 1px,
              transparent 1px,
              transparent 2px
            )`,
            backgroundSize: '100% 2px',
            zIndex: 1,
          }}
          animate={{
            backgroundPosition: ['0px 0px', '0px -20px'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </Button>
  );
};

export default CyberButton;
