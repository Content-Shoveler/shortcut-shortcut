import React from 'react';
import { TextField, TextFieldProps, useTheme, alpha, Box } from '@mui/material';
import { motion } from 'framer-motion';

// Motion component for animation effects
const MotionBox = motion(Box);

interface CyberTextFieldProps extends Omit<TextFieldProps, 'css'> {
  cornerClip?: boolean;
  scanlineEffect?: boolean;
  glowIntensity?: number;
  accentColor?: string;
}

/**
 * Cyberpunk-themed text field component
 */
const CyberTextField: React.FC<CyberTextFieldProps> = ({
  cornerClip = true,
  scanlineEffect = false,
  glowIntensity = 0.3,
  accentColor,
  sx,
  ...textFieldProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const fieldAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate clip path for corner-clipped style
  const clipPath = cornerClip 
    ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
    : undefined;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${5 * glowIntensity}px ${alpha(fieldAccentColor, 0.5)}`
    : 'none';

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        {...textFieldProps}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            clipPath: clipPath,
            transition: 'all 0.3s ease',
            borderRadius: cornerClip ? 0 : 1,
            overflow: 'hidden',
            
            // Border styling
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(fieldAccentColor, 0.3),
              transition: 'all 0.3s ease',
            },
            
            // Hover state
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: alpha(fieldAccentColor, 0.7),
            },
            
            // Focused state
            '&.Mui-focused': {
              boxShadow: glowEffect,
              
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: fieldAccentColor,
                borderWidth: '1px',
              },
              
              // Add corner accents when focused
              '&::before': cornerClip ? {
                content: '""',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '8px',
                height: '8px',
                borderTop: `2px solid ${fieldAccentColor}`,
                borderRight: `2px solid ${fieldAccentColor}`,
                zIndex: 1,
              } : {},
              
              '&::after': cornerClip ? {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '8px',
                height: '8px',
                borderBottom: `2px solid ${fieldAccentColor}`,
                borderLeft: `2px solid ${fieldAccentColor}`,
                zIndex: 1,
              } : {},
            },
          },
          
          // Label styling
          '& .MuiInputLabel-root': {
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: '0.05em',
            
            '&.Mui-focused': {
              color: fieldAccentColor,
            },
          },
          
          // Helper text styling
          '& .MuiFormHelperText-root': {
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.7rem',
            marginLeft: cornerClip ? '8px' : '14px',
            transition: 'all 0.3s ease',
            color: theme.palette.text.secondary,
          },
          
          // Override with any provided sx props
          ...sx
        }}
      />
      
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
    </Box>
  );
};

export default CyberTextField;
