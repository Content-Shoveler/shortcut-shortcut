import React from 'react';
import { Tabs, TabsProps, Tab, TabProps, Box, useTheme, alpha } from '@mui/material';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

interface CyberTabsProps extends Omit<TabsProps, 'css'> {
  glowIntensity?: number;
  accentColor?: string;
  scanlineEffect?: boolean;
  cornerClip?: boolean;
}

interface CyberTabProps extends Omit<TabProps, 'css'> {
  accentColor?: string;
}

/**
 * Cyberpunk-themed Tab component
 */
const CyberTab = React.forwardRef<HTMLDivElement, CyberTabProps>(({
  accentColor,
  ...tabProps
}, ref) => {
  const theme = useTheme();
  
  // Determine the accent color
  const tabAccentColor = accentColor || theme.palette.secondary.main;
  
  return (
    <Tab
      ref={ref}
      {...tabProps}
      sx={{
        fontFamily: "'Rajdhani', sans-serif",
        letterSpacing: '0.05em',
        textTransform: 'none',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 4px',
        minWidth: '100px',
        fontSize: '0.95rem',
        
        // Create custom underlines and effects for the tab
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '0%',
          height: '2px',
          backgroundColor: alpha(tabAccentColor, 0.7),
          transform: 'translateX(-50%)',
          transition: 'width 0.3s ease',
          zIndex: 1,
        },
        
        // Hover states
        '&:hover': {
          backgroundColor: alpha(tabAccentColor, 0.1),
          '&::before': {
            width: '30%',
          },
        },
        
        // Selected tab
        '&.Mui-selected': {
          color: theme.palette.mode === 'dark' ? tabAccentColor : theme.palette.primary.dark,
          '&::before': {
            width: '70%',
          },
          
          // Add top border accent when selected
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '30%',
            height: '2px',
            backgroundColor: tabAccentColor,
            transform: 'translateX(-50%)',
          },
        },
        
        // Disabled tab
        '&.Mui-disabled': {
          opacity: 0.5,
        },
        
        // Override with any provided sx props
        ...tabProps.sx,
      }}
    />
  );
});

/**
 * Cyberpunk-themed Tabs component with custom animated indicator
 */
const CyberTabs: React.FC<CyberTabsProps> & { Tab: typeof CyberTab } = ({
  glowIntensity = 0.5,
  accentColor,
  scanlineEffect = false,
  cornerClip = true,
  children,
  sx,
  ...tabsProps
}) => {
  const theme = useTheme();
  
  // Determine the accent color
  const tabsAccentColor = accentColor || theme.palette.secondary.main;
  
  // Calculate glow effect based on theme mode and provided intensity
  const glowEffect = theme.palette.mode === 'dark'
    ? `0 0 ${5 * glowIntensity}px ${alpha(tabsAccentColor, 0.5)}`
    : 'none';
  
  // Calculate clip path for corner-clipped style
  const clipPath = cornerClip 
    ? 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)'
    : undefined;

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Tabs
        {...tabsProps}
        TabIndicatorProps={{
          children: <Box />,
          ...(tabsProps.TabIndicatorProps || {}),
        }}
        sx={{
          minHeight: '48px',
          borderBottom: `1px solid ${alpha(tabsAccentColor, 0.2)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          backdropFilter: 'blur(5px)',
          clipPath: clipPath,
          overflow: 'visible',
          
          // Custom indicator styling
          '& .MuiTabs-indicator': {
            display: 'flex',
            justifyContent: 'center',
            height: '3px',
            backgroundColor: 'transparent',
            
            '&::before': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              width: '80%',
              height: '100%',
              backgroundColor: tabsAccentColor,
              borderRadius: '4px 4px 0 0',
              boxShadow: glowEffect,
            },
          },
          
          // Scrollable tabs styling
          '& .MuiTabs-scrollButtons': {
            color: alpha(tabsAccentColor, 0.7),
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
          
          // Override with provided sx props
          ...sx,
        }}
      >
        {/* Wrap children in CyberTab if needed */}
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === CyberTab) {
            return child;
          }
          if (React.isValidElement(child) && child.type === Tab) {
            return <CyberTab {...(child.props as TabProps)} accentColor={tabsAccentColor} />;
          }
          return child;
        })}
      </Tabs>
      
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

// Attach CyberTab to CyberTabs
CyberTabs.Tab = CyberTab;

export default CyberTabs;
