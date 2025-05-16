import React, { useState, useRef } from 'react';
import {
  TextField,
  Chip,
  Box,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  IconButton,
  Typography,
  useTheme,
  alpha,
} from '@mui/material';
import { motion } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

// Motion component for animation effects
const MotionBox = motion(Box);

export interface MultiSelectOption {
  id: string | number;
  name: string;
  color?: string;
}

interface CyberMultiSelectProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  options: MultiSelectOption[];
  value: MultiSelectOption[];
  onChange: (selectedItems: MultiSelectOption[]) => void;
  cornerClip?: boolean;
  scanlineEffect?: boolean;
  glowIntensity?: number;
  accentColor?: string;
  fullWidth?: boolean;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
}

/**
 * Cyberpunk-themed multi-select component
 * This component allows selecting multiple options from a dropdown
 */
const CyberMultiSelect: React.FC<CyberMultiSelectProps> = ({
  label,
  placeholder = 'Select options...',
  helperText,
  options,
  value = [],
  onChange,
  cornerClip = true,
  scanlineEffect = false,
  glowIntensity = 0.3,
  accentColor,
  fullWidth = true,
  disabled = false,
  required = false,
  error = false,
}) => {
  const theme = useTheme();
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  
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

  // Filter options based on search text
  const filteredOptions = options.filter(
    option => 
      !value.some(item => item.id === option.id) && // Not already selected
      option.name.toLowerCase().includes(searchText.toLowerCase()) // Matches search
  );

  // Handle opening the dropdown
  const handleOpen = () => {
    if (!disabled) {
      setOpen(true);
    }
  };

  // Handle closing the dropdown
  const handleClose = () => {
    setOpen(false);
    setSearchText('');
  };

  // Handle selecting an item
  const handleSelectItem = (option: MultiSelectOption) => {
    const newValue = [...value, option];
    onChange(newValue);
  };

  // Handle removing an item
  const handleRemoveItem = (id: string | number) => {
    const newValue = value.filter(item => item.id !== id);
    onChange(newValue);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto', position: 'relative' }}>
      {/* Label */}
      {label && (
        <Typography 
          variant="body2" 
          component="label" 
          sx={{ 
            display: 'block', 
            mb: 0.5, 
            fontFamily: "'Rajdhani', sans-serif",
            letterSpacing: '0.05em',
            ml: 1,
            color: error 
              ? theme.palette.error.main 
              : theme.palette.text.secondary
          }}
        >
          {label}{required && ' *'}
        </Typography>
      )}
      
      {/* Selected Items Display */}
      <Box
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          padding: theme.spacing(1.5),
          minHeight: '56px',
          border: `1px solid ${
            error 
              ? theme.palette.error.main 
              : alpha(fieldAccentColor, 0.3)
          }`,
          borderRadius: cornerClip ? 0 : 1,
          clipPath: clipPath,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          cursor: disabled ? 'default' : 'pointer',
          transition: 'all 0.3s ease',
          alignItems: 'flex-start',
          alignContent: 'flex-start',
          position: 'relative',
          
          '&:hover': {
            borderColor: disabled 
              ? alpha(fieldAccentColor, 0.3) 
              : alpha(fieldAccentColor, 0.7),
          },
          
          ...(open && {
            borderColor: fieldAccentColor,
            boxShadow: glowEffect,
            
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
          }),
        }}
      >
        {value.length > 0 ? (
          value.map(item => (
            <Chip
              key={item.id}
              label={item.name}
              variant="outlined"
              size="small"
              clickable
              deleteIcon={
                <CloseIcon fontSize="small" />
              }
              onDelete={() => !disabled && handleRemoveItem(item.id)}
              onClick={(e) => e.stopPropagation()}
              sx={{
                backgroundColor: item.color 
                  ? alpha(item.color, 0.1) 
                  : alpha(fieldAccentColor, 0.1),
                border: `1px solid ${
                  item.color 
                    ? alpha(item.color, 0.5) 
                    : alpha(fieldAccentColor, 0.3)
                }`,
                '& .MuiChip-deleteIcon': {
                  color: item.color || fieldAccentColor,
                  '&:hover': {
                    color: item.color ? alpha(item.color, 0.7) : undefined,
                  }
                },
                // Cyber style for chips
                borderRadius: '4px',
                clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                fontFamily: "'Rajdhani', sans-serif",
                letterSpacing: '0.03em',
                '& .MuiChip-label': {
                  padding: theme.spacing(0, 1),
                },
              }}
            />
          ))
        ) : (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ opacity: 0.7 }}
          >
            {placeholder}
          </Typography>
        )}
        
        {/* Dropdown indicator */}
        <InputAdornment
          position="end"
          sx={{
            position: 'absolute',
            right: theme.spacing(1),
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        >
          <ExpandMoreIcon
            fontSize="small"
            sx={{
              color: alpha(theme.palette.text.primary, 0.5),
              transition: 'transform 0.3s ease',
              transform: open ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        </InputAdornment>
      </Box>
      
      {/* Helper text */}
      {helperText && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '0.7rem',
            marginLeft: cornerClip ? '8px' : '14px',
            transition: 'all 0.3s ease',
            color: error ? theme.palette.error.main : theme.palette.text.secondary,
          }}
        >
          {helperText}
        </Typography>
      )}
      
      {/* Dropdown Popover */}
      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
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
            width: anchorRef.current?.offsetWidth || 'auto',
            maxHeight: 300,
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
              zIndex: 1,
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
              zIndex: 1,
            } : {},
          }
        }}
      >
        {/* Search field */}
        <Box p={1}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            placeholder="Search..."
            value={searchText}
            onChange={handleSearchChange}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: alpha(theme.palette.background.paper, 0.05),
                '& fieldset': {
                  borderColor: alpha(fieldAccentColor, 0.3),
                },
                '&:hover fieldset': {
                  borderColor: alpha(fieldAccentColor, 0.5),
                },
                '&.Mui-focused fieldset': {
                  borderColor: fieldAccentColor,
                },
              },
            }}
          />
        </Box>
        
        {/* Options list */}
        <List sx={{ p: 0, maxHeight: 220, overflow: 'auto' }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <ListItem key={option.id} disablePadding>
                <ListItemButton
                  onClick={() => {
                    handleSelectItem(option);
                    handleClose();
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(fieldAccentColor, 0.1),
                    },
                  }}
                >
                  {option.color && (
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        mr: 1,
                        borderRadius: '2px',
                        backgroundColor: option.color,
                      }}
                    />
                  )}
                  <ListItemText primary={option.name} />
                </ListItemButton>
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText
                primary="No options available"
                sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}
              />
            </ListItem>
          )}
        </List>
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

export default CyberMultiSelect;
