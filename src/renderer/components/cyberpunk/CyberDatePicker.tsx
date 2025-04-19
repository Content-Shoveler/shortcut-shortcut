import React, { useState } from 'react';
import {
  TextField,
  TextFieldProps,
  InputAdornment,
  useTheme,
  alpha,
  Box,
  Popover,
  IconButton,
} from '@mui/material';
import { motion } from 'framer-motion';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Motion component for animation effects
const MotionBox = motion(Box);

interface CyberDatePickerProps {
  cornerClip?: boolean;
  scanlineEffect?: boolean;
  glowIntensity?: number;
  accentColor?: string;
  value: string;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  fullWidth?: boolean;
  sx?: any;
}

/**
 * Cyberpunk-themed date picker component
 * This component provides a text field with date input capabilities
 */
const CyberDatePicker: React.FC<CyberDatePickerProps> = ({
  cornerClip = true,
  scanlineEffect = false,
  glowIntensity = 0.3,
  accentColor,
  value,
  onChange,
  sx,
  label,
  placeholder = "YYYY-MM-DD",
  helperText,
  required,
  disabled,
  error,
  fullWidth,
}) => {
  const theme = useTheme();
  
  // State for handling the popover
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  
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

  // Handle opening the date picker
  const handleOpenPicker = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle closing the date picker
  const handleClosePicker = () => {
    setAnchorEl(null);
  };

  // Handle direct input to the text field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Handle date selection from native date input
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    handleClosePicker();
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        label={label}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        error={error}
        fullWidth={fullWidth}
        helperText={helperText}
        onClick={handleOpenPicker}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton 
                edge="end" 
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the TextField onClick
                  handleOpenPicker(e as any);
                }}
                sx={{ 
                  color: fieldAccentColor,
                  '&:hover': {
                    backgroundColor: alpha(fieldAccentColor, 0.1)
                  }
                }}
              >
                <CalendarTodayIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          )
        }}
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
          },
          
          // Override with any provided sx props
          ...sx
        }}
      />
      
      {/* Date picker popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClosePicker}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            p: 2,
            backgroundColor: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.9)
              : theme.palette.background.paper,
            border: `1px solid ${alpha(fieldAccentColor, 0.2)}`,
            boxShadow: theme.palette.mode === 'dark'
              ? `0 0 10px ${alpha(fieldAccentColor, 0.3)}`
              : theme.shadows[3],
            borderRadius: 1,
            clipPath: cornerClip 
              ? 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))'
              : undefined,
            '&::before': cornerClip ? {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '10px',
              height: '10px',
              borderTop: `2px solid ${fieldAccentColor}`,
              borderRight: `2px solid ${fieldAccentColor}`,
            } : {},
            '&::after': cornerClip ? {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '10px',
              height: '10px',
              borderBottom: `2px solid ${fieldAccentColor}`,
              borderLeft: `2px solid ${fieldAccentColor}`,
            } : {},
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          {/* Native date input for now - could be enhanced with a custom calendar */}
          <input
            type="date"
            value={value}
            onChange={handleDateSelect}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              border: `1px solid ${alpha(fieldAccentColor, 0.3)}`,
              borderRadius: '4px',
              color: theme.palette.text.primary,
              outline: 'none',
              fontFamily: "'Rajdhani', sans-serif",
              fontSize: '1rem',
            }}
          />
        </Box>
      </Popover>
      
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

export default CyberDatePicker;
