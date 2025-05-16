import React, { ReactNode } from 'react';
import { Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  CyberBaseProps, 
  getCornerClipPath, 
  getGlowEffect, 
  getCornerAccents, 
  getScanlineStyles 
} from '../../utils/cyberpunkUtils';
import { scanlineVariants, dataFlowVariants } from '../../utils/animations/cyberpunk';
import { cornerClip as cornerClipTokens } from '../../theme/cyberpunkTokens';

// Create a motion component
const MotionBox = motion(Box);

interface CyberBaseComponentProps extends CyberBaseProps {
  children: ReactNode;
  component?: React.ElementType;
  sx?: any;
  dataFlowDirection?: 'ltr' | 'rtl' | 'ttb' | 'btt';
  [key: string]: any; // Allow any other props to be passed
}

/**
 * CyberBase - Foundation component for all cyberpunk styled components
 * 
 * This component provides the basic cyberpunk styling features that can be applied
 * to any component, such as corner clipping, scanline effects, and glow effects.
 */
const CyberBase: React.FC<CyberBaseComponentProps> = ({
  children,
  component = 'div',
  cornerClip = true,
  scanlineEffect = false,
  glowIntensity = 'none',
  accentColor,
  dataFlow = false,
  dataFlowDirection = 'ltr',
  sx = {},
  ...props
}) => {
  const theme = useTheme();
  
  // Determine corner clip size if enabled
  const clipPath = cornerClip 
    ? getCornerClipPath(typeof cornerClip === 'boolean' ? 'md' : cornerClip) 
    : undefined;
  
  // Determine if we need corner accents (only if corner clipping is enabled)
  const needsCornerAccents = !!cornerClip;
  
  // Get the corner accent color
  const cornerAccentColor = accentColor || theme.palette.secondary.main;
  
  // Get base component styles
  const baseStyles = {
    position: 'relative',
    overflow: 'hidden',
    ...sx,
    ...(clipPath ? { clipPath } : {}),
    ...(needsCornerAccents ? getCornerAccents(theme, 
      typeof cornerClip === 'boolean' 
        ? cornerClipTokens.md 
        : (typeof cornerClip === 'string' ? cornerClipTokens[cornerClip] : cornerClipTokens.md),
      cornerAccentColor
    ) : {}),
  };

  return (
    <Box 
      component={component} 
      sx={baseStyles}
      {...props}
    >
      {/* Main content */}
      {children}
      
      {/* Optional data flow effect */}
      {dataFlow && (
        <MotionBox
          variants={dataFlowDirection === 'ttb' || dataFlowDirection === 'btt' 
            ? { initial: dataFlowVariants.initialVertical, animate: dataFlowVariants.animateVertical }
            : dataFlowVariants}
          initial="initial"
          animate="animate"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(${dataFlowDirection === 'ttb' || dataFlowDirection === 'btt' ? '180deg' : '90deg'}, 
              transparent 0%, 
              ${alpha(cornerAccentColor, 0.2)} 50%, 
              transparent 100%
            )`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {/* Optional scanline effect */}
      {scanlineEffect && (
        <MotionBox
          variants={scanlineVariants}
          initial="initial"
          animate="animate"
          sx={getScanlineStyles()}
        />
      )}
    </Box>
  );
};

/**
 * CyberMotionBase - A motion-enhanced version of CyberBase for animation
 */
export const CyberMotionBase: React.FC<CyberBaseComponentProps & {
  variants?: any;
  initial?: any;
  animate?: any;
  whileHover?: any;
  whileTap?: any;
  exit?: any;
  transition?: any;
}> = ({
  children,
  variants,
  initial,
  animate,
  whileHover,
  whileTap,
  exit,
  transition,
  ...baseProps
}) => {
  // Simplify by using MotionBox wrapping CyberBase
  return (
    <MotionBox
      variants={variants}
      initial={initial}
      animate={animate}
      whileHover={whileHover}
      whileTap={whileTap}
      exit={exit}
      transition={transition}
    >
      <CyberBase {...baseProps}>
        {children}
      </CyberBase>
    </MotionBox>
  );
};

export default CyberBase;
