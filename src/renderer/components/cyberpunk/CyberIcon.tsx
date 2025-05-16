import React from 'react';
import { Box, IconButton, IconButtonProps, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { SvgIconComponent } from '@mui/icons-material';
import { useCyberpunkRive } from '../../utils/riveUtils';

// Create a motion component for animations
const MotionBox = motion(Box);

// Define props for the icon component
interface CyberIconProps {
  icon: SvgIconComponent;
  riveIcon?: string;
  size?: number;
  color?: string;
  glowIntensity?: number;
  pulse?: boolean;
  rotate?: boolean;
  scanlineEffect?: boolean;
}

// Define props for the icon button component
interface CyberIconButtonProps extends Omit<IconButtonProps, 'css'> {
  icon: SvgIconComponent;
  riveIcon?: string;
  iconSize?: number;  // Renamed to avoid conflict with IconButton's size property
  glowIntensity?: number;
  pulse?: boolean;
  rotate?: boolean;
  scanlineEffect?: boolean;
  accentColor?: string;
}

/**
 * Cyberpunk-themed icon component that can display MUI icons or Rive animations
 * with cyberpunk styling
 */
const CyberIcon: React.FC<CyberIconProps> = ({
  icon: Icon,
  riveIcon,
  size = 24,
  color,
  glowIntensity = 0.5,
  pulse = false,
  rotate = false,
  scanlineEffect = false,
}) => {
  const theme = useTheme();
  
  // Determine the icon color
  const iconColor = color || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${5 * glowIntensity}px ${alpha(iconColor, 0.7)}`
    : 'none';
  
  // Use Rive animation if provided
  const useRive = !!riveIcon;
  const { RiveComponent } = useRive ? useCyberpunkRive({
    src: `/src/renderer/assets/rive/${riveIcon}.riv`,
  }) : { RiveComponent: null };

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      {useRive && RiveComponent ? (
        // Render Rive animation if available
        <RiveComponent
          style={{
            width: size,
            height: size,
            filter: `drop-shadow(${glowEffect})`,
          }}
        />
      ) : (
        // Render MUI icon with animations
        <MotionBox
          animate={
            rotate 
              ? { rotate: 360 }
              : pulse
                ? { scale: [1, 1.1, 1] }
                : {}
          }
          transition={
            rotate
              ? { duration: 3, repeat: Infinity, ease: 'linear' }
              : pulse
                ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
                : {}
          }
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
              color: iconColor,
              filter: `drop-shadow(${glowEffect})`,
              transition: 'all 0.3s ease',
            }}
          />
        </MotionBox>
      )}
      
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
            opacity: 0.1,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              ${theme.palette.text.primary},
              ${theme.palette.text.primary} 1px,
              transparent 1px,
              transparent 2px
            )`,
            backgroundSize: '100% 2px',
            borderRadius: '50%',
            zIndex: 1,
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

/**
 * Cyberpunk-themed icon button component
 */
const CyberIconButton: React.FC<CyberIconButtonProps> = ({
  icon,
  riveIcon,
  iconSize = 24,
  glowIntensity = 0.5,
  pulse = false,
  rotate = false,
  scanlineEffect = false,
  accentColor,
  sx,
  ...buttonProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const buttonAccentColor = accentColor || theme.palette.secondary.main;
  
  return (
    <IconButton
      {...buttonProps}
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: alpha(buttonAccentColor, 0.1),
          transform: 'translateY(-2px)',
        },
        '&:active': {
          transform: 'translateY(0px)',
        },
        ...sx,
      }}
    >
      <CyberIcon
        icon={icon}
        riveIcon={riveIcon}
        size={iconSize}
        color={buttonAccentColor}
        glowIntensity={glowIntensity}
        pulse={pulse}
        rotate={rotate}
        scanlineEffect={scanlineEffect}
      />
    </IconButton>
  );
};

// Define the type for the component with Button property
type CyberIconComponent = React.FC<CyberIconProps> & {
  Button: React.FC<CyberIconButtonProps>;
};

// Attach CyberIconButton to CyberIcon with proper typing
const CyberIconWithButton = CyberIcon as CyberIconComponent;
CyberIconWithButton.Button = CyberIconButton;

export default CyberIconWithButton;
