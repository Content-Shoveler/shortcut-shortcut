import React from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { useCyberpunkRive } from '../../utils/riveUtils';

interface CyberSpinnerProps {
  size?: number;
  color?: string;
  thickness?: number;
}

/**
 * A cyberpunk-themed loading spinner that combines Framer Motion animations with CSS
 * The component provides a fallback animation if Rive assets aren't available
 */
const CyberSpinner: React.FC<CyberSpinnerProps> = ({ 
  size = 40,
  color,
  thickness = 2
}) => {
  const theme = useTheme();
  
  // Default to theme secondary color if no color provided
  const spinnerColor = color || theme.palette.secondary.main;
  
  return (
    <Box sx={{ position: 'relative', width: size, height: size }}>
      {/* Outer rotating ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '50%',
          border: `${thickness}px solid transparent`,
          borderTopColor: spinnerColor,
          borderRightColor: spinnerColor,
        }}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 1.5, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      />
      
      {/* Inner rotating ring */}
      <motion.div
        style={{
          position: 'absolute',
          top: size * 0.2,
          left: size * 0.2,
          right: size * 0.2,
          bottom: size * 0.2,
          borderRadius: '2px',
          borderTop: `${thickness}px solid ${spinnerColor}`,
          borderLeft: `${thickness}px solid ${spinnerColor}`,
        }}
        animate={{ rotate: -180 }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut",
          repeatType: 'reverse'
        }}
      />

      {/* Pulsing center dot */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 0.1,
          height: size * 0.1,
          backgroundColor: spinnerColor,
          borderRadius: '2px',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{ 
          opacity: [1, 0.3, 1],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 1.2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Cross scan lines */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: thickness/2,
          backgroundColor: spinnerColor,
          transform: 'translateY(-50%)',
          opacity: 0.5
        }}
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          height: [thickness/2, thickness, thickness/2]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: thickness/2,
          backgroundColor: spinnerColor,
          transform: 'translateX(-50%)',
          opacity: 0.5
        }}
        animate={{ 
          opacity: [0.5, 0.8, 0.5],
          width: [thickness/2, thickness, thickness/2]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />
    </Box>
  );
};

export default CyberSpinner;
