import React from 'react';
import { 
  Radio, 
  RadioProps, 
  RadioGroup, 
  RadioGroupProps,
  FormControlLabel, 
  FormControlLabelProps,
  FormControl,
  FormLabel,
  useTheme, 
  alpha, 
  Box 
} from '@mui/material';
import { motion } from 'framer-motion';

// Create a motion component for animations
const MotionBox = motion(Box);

interface CyberRadioProps extends Omit<RadioProps, 'css'> {
  glowIntensity?: number;
  accentColor?: string;
  scanlineEffect?: boolean;
}

interface CyberRadioGroupProps extends Omit<RadioGroupProps, 'css'> {
  label?: string;
  helperText?: string;
  accentColor?: string;
}

interface CyberFormControlLabelProps extends Omit<FormControlLabelProps, 'css' | 'control'> {
  accentColor?: string;
  control?: React.ReactElement;
}

/**
 * Cyberpunk-themed Radio component
 */
const CyberRadio: React.FC<CyberRadioProps> = ({
  glowIntensity = 0.5,
  accentColor,
  scanlineEffect = false,
  sx,
  ...radioProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const radioAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${4 * glowIntensity}px ${alpha(radioAccentColor, 0.7)}`
    : 'none';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <Radio
        {...radioProps}
        sx={{
          '&:hover': {
            backgroundColor: alpha(radioAccentColor, 0.1),
          },
          '&.Mui-checked': {
            color: radioAccentColor,
            '& .MuiSvgIcon-root': {
              filter: `drop-shadow(${glowEffect})`,
            },
          },
          // Custom radio styling
          '& .MuiSvgIcon-root': {
            fontSize: 20,
            transition: 'all 0.3s ease',
          },
          // Override with provided sx props
          ...sx,
        }}
      />
      
      {/* Optional scanline effect */}
      {scanlineEffect && radioProps.checked && (
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
 * Cyberpunk-themed FormControlLabel for radio buttons
 */
const CyberFormControlLabel: React.FC<CyberFormControlLabelProps> = ({
  accentColor,
  control,
  sx,
  ...labelProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const labelAccentColor = accentColor || theme.palette.secondary.main;
  
  return (
    <FormControlLabel
      control={control || <CyberRadio accentColor={labelAccentColor} />}
      {...labelProps}
      sx={{
        '& .MuiFormControlLabel-label': {
          fontFamily: "'Rajdhani', sans-serif",
          letterSpacing: '0.02em',
          fontSize: '0.95rem',
          transition: 'all 0.3s ease',
        },
        '&:hover .MuiFormControlLabel-label': {
          color: theme.palette.text.primary,
        },
        // Override with provided sx props
        ...sx,
      }}
    />
  );
};

/**
 * Cyberpunk-themed RadioGroup component
 */
const CyberRadioGroup: React.FC<CyberRadioGroupProps> = ({
  label,
  helperText,
  accentColor,
  children,
  ...radioGroupProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const groupAccentColor = accentColor || theme.palette.secondary.main;

  return (
    <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
      {label && (
        <FormLabel 
          component="legend"
          sx={{
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: '0.05em',
            fontSize: '0.95rem',
            color: alpha(theme.palette.text.primary, 0.7),
            '&.Mui-focused': {
              color: groupAccentColor,
            },
            mb: 1,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -4,
              left: 0,
              width: '30px',
              height: '2px',
              backgroundColor: alpha(groupAccentColor, 0.5),
            }
          }}
        >
          {label}
        </FormLabel>
      )}
      <RadioGroup {...radioGroupProps as RadioGroupProps}>
        {children}
      </RadioGroup>
      {helperText && (
        <Box
          component="p"
          sx={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.7rem',
            mt: 0.5,
            color: alpha(theme.palette.text.secondary, 0.8),
          }}
        >
          {helperText}
        </Box>
      )}
    </FormControl>
  );
};

// Attach components to CyberRadio
const CyberRadioWithComponents = Object.assign(CyberRadio, {
  Group: CyberRadioGroup,
  FormControlLabel: CyberFormControlLabel,
});

export default CyberRadioWithComponents;
