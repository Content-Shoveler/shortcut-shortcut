import React from 'react';
import { motion } from 'framer-motion';
import { Tooltip, Box, useTheme, alpha } from '@mui/material';
import { SvgIconComponent } from '@mui/icons-material';
import { themeToggleVariants, viewModeToggleVariants, buttonGlowVariants } from '../../utils/animations/toggleButtons';

// Create a motion Box component
const MotionBox = motion(Box);

interface CyberToggleButtonProps {
  icon: SvgIconComponent;
  tooltip: string;
  onClick: () => void;
  variant: 'theme' | 'view';
  currentState: string;
  size?: number;
  accentColor?: string;
  scanlineEffect?: boolean;
}

/**
 * Animated toggle button with cyberpunk styling
 * This component is used for theme and view mode toggles with specialized animations
 */
const CyberToggleButton: React.FC<CyberToggleButtonProps> = ({
  icon: Icon,
  tooltip,
  onClick,
  variant,
  currentState,
  size = 24,
  accentColor,
  scanlineEffect = false,
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const buttonAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 8px ${alpha(buttonAccentColor, 0.7)}`
    : 'none';

  // Enhanced click handler with debugging
  const handleClick = (event: React.MouseEvent) => {
    console.log(`CyberToggleButton clicked: variant=${variant}, currentState=${currentState}`);
    
    // Stop propagation to prevent any parent elements from catching the event
    event.stopPropagation();
    
    // Call the provided onClick handler
    onClick();
  };
  
  return (
    <Tooltip title={tooltip}>
      <Box sx={{ position: 'relative' }}>
        <MotionBox
          onClick={handleClick}
          whileHover="hover"
          whileTap="click"
          initial="initial"
          animate={currentState}
          variants={buttonGlowVariants}
          role="button"
          tabIndex={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size * 1.75,
            height: size * 1.75,
            backgroundColor: alpha(buttonAccentColor, 0.05),
            border: `1px solid ${alpha(buttonAccentColor, 0.5)}`,
            borderRadius: 0,
            cursor: 'pointer',
            padding: 0,
            outline: 'none',
            transition: 'all 0.3s ease',
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
            
            // Before pseudo-element for corner accents
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '6px',
              height: '6px',
              top: '0',
              right: '0',
              borderTop: `2px solid ${buttonAccentColor}`,
              borderRight: `2px solid ${buttonAccentColor}`,
            },
            
            // After pseudo-element for corner accents
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '6px',
              height: '6px',
              bottom: '0',
              left: '0',
              borderBottom: `2px solid ${buttonAccentColor}`,
              borderLeft: `2px solid ${buttonAccentColor}`,
            },
            
            // Hover effects
            '&:hover': {
              backgroundColor: alpha(buttonAccentColor, 0.1),
              boxShadow: glowEffect,
            },
          }}
        >
          {/* Icon with animations */}
          <MotionBox
            initial="initial"
            animate={currentState}
            variants={variant === 'theme' ? themeToggleVariants : viewModeToggleVariants}
            sx={{ 
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center',
            }}
          >
            <Icon
              sx={{
                width: size,
                height: size,
                color: buttonAccentColor,
                filter: `drop-shadow(0 0 3px ${alpha(buttonAccentColor, 0.7)})`,
              }}
            />
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
        </MotionBox>
      </Box>
    </Tooltip>
  );
};

export default CyberToggleButton;
