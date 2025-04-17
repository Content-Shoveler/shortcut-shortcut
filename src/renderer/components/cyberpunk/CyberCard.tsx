import React, { ReactNode } from 'react';
import { Card, CardProps, Box, Typography, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../utils/animations';

// Create a motion component
const MotionBox = motion(Box);

interface CyberCardProps extends Omit<CardProps, 'css'> {
  title?: string;
  cornerAccent?: boolean;
  glowOnHover?: boolean;
  dataFlowEffect?: boolean;
  children: ReactNode;
  hoverEffect?: boolean;
  accentColor?: string;
}

/**
 * A cyberpunk-themed card component with various visual effects
 */
const CyberCard: React.FC<CyberCardProps> = ({
  title,
  cornerAccent = true,
  glowOnHover = true,
  dataFlowEffect = false,
  children,
  hoverEffect = true,
  accentColor,
  sx,
  ...cardProps
}) => {
  const theme = useTheme();
  
  // Use provided accent color or default to secondary from theme
  const accent = accentColor || theme.palette.secondary.main;
  
  // Only apply hover animations if enabled
  const variants = hoverEffect ? cardHoverVariants : undefined;

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'visible',
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        
        // Conditional corner accent styling
        ...(cornerAccent && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '15px',
            height: '15px',
            borderTop: `2px solid ${accent}`,
            borderRight: `2px solid ${accent}`,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '15px',
            height: '15px',
            borderBottom: `2px solid ${accent}`,
            borderLeft: `2px solid ${accent}`,
            zIndex: 1,
          }
        }),
        
        // Transition for hover effects
        transition: 'all 0.3s ease',
        
        // Hover effects if enabled
        '&:hover': {
          ...(glowOnHover && {
            boxShadow: theme.palette.mode === 'dark' 
              ? `0 0 15px ${alpha(accent, 0.5)}` 
              : `0 5px 15px ${alpha(accent, 0.2)}`,
          })
        },
        
        // Additional styles passed via sx prop
        ...sx
      }}
      {...cardProps}
    >
      {/* Hover effect wrapper */}
      <MotionBox
        variants={variants}
        initial={hoverEffect ? "initial" : undefined}
        whileHover={hoverEffect ? "hover" : undefined}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
      {/* Optional title */}
      {title && (
        <Box
          sx={{
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            mb: 2,
            pb: 1,
            pl: 2,
            pr: 2,
            pt: 2,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '60%',
              background: accent,
              opacity: 0.8,
            }
          }}
        >
          <Typography 
            variant="h6" 
            component="div"
            sx={{ 
              fontWeight: 'bold',
              letterSpacing: '0.03em',
            }}
          >
            {title}
          </Typography>
        </Box>
      )}
      
      {/* Card content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 0
        }}
      >
        {children}
      </Box>
      
      {/* Optional data flow animation effect */}
      {dataFlowEffect && (
        <Box
          component={motion.div}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${alpha(accent, 0.1)} 50%, 
              transparent 100%
            )`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'linear',
          }}
        />
      )}
    </Card>
  );
};

export default CyberCard;
