import React, { ReactNode } from 'react';
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  DialogProps as MuiDialogProps,
  IconButton,
  Typography,
  Box,
  alpha,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';
import CyberBase from './CyberBase';
import { getCornerClipPath, getCornerAccents, CyberBaseProps } from '../../utils/cyberpunkUtils';
import { dialogVariants } from '../../utils/animations/cyberpunk';

// Motion components
const MotionDialogContent = motion(MuiDialogContent);

interface CyberDialogTitleProps {
  children?: ReactNode;
  onClose?: () => void;
  icon?: ReactNode;
  accentColor?: string;
}

/**
 * Custom title component for CyberDialog
 */
const CyberDialogTitle: React.FC<CyberDialogTitleProps> = ({
  children,
  onClose,
  icon,
  accentColor,
  ...other
}) => {
  const theme = useTheme();
  const titleColor = accentColor || theme.palette.primary.main;
  
  return (
    <MuiDialogTitle
      sx={{
        m: 0,
        p: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          display: 'block',
          width: '4px',
          height: '60%',
          background: titleColor,
          position: 'absolute',
          left: 0,
          top: '20%',
        }
      }}
      {...other}
    >
      {icon && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mr: 1,
          color: titleColor
        }}>
          {icon}
        </Box>
      )}
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          flex: 1,
          fontFamily: "'Rajdhani', sans-serif",
          fontWeight: 600,
          letterSpacing: '0.02em',
        }}
      >
        {children}
      </Typography>
      {onClose && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
    </MuiDialogTitle>
  );
};

interface CyberDialogContentProps {
  children: ReactNode;
  animated?: boolean;
  sx?: any;
}

/**
 * Custom content component for CyberDialog
 */
const CyberDialogContent: React.FC<CyberDialogContentProps> = ({
  children,
  animated = false,
  ...props
}) => {
  if (animated) {
    return (
      <MotionDialogContent
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        {...props}
      >
        {children}
      </MotionDialogContent>
    );
  }
  
  return (
    <MuiDialogContent {...props}>
      {children}
    </MuiDialogContent>
  );
};

/**
 * Custom actions component for CyberDialog
 */
const CyberDialogActions: React.FC<{ children: ReactNode }> = ({ children, ...props }) => {
  const theme = useTheme();
  
  return (
    <MuiDialogActions
      sx={{
        px: 3,
        py: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
      }}
      {...props}
    >
      {children}
    </MuiDialogActions>
  );
};

export interface CyberDialogProps extends Omit<MuiDialogProps, 'title'>, CyberBaseProps {
  title?: ReactNode;
  titleIcon?: ReactNode;
  onClose?: () => void;
  actions?: ReactNode;
  animated?: boolean;
  contentSx?: any;
  fullWidth?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * CyberDialog - A cyberpunk-styled dialog component
 * 
 * This component provides a consistent dialog styling with cyberpunk aesthetics
 * including corner clipping, optional animations, and data flow effects.
 */
const CyberDialog: React.FC<CyberDialogProps> = ({
  children,
  title,
  titleIcon,
  onClose,
  actions,
  open,
  animated = true,
  cornerClip = true,
  scanlineEffect = false,
  glowIntensity = 'low',
  accentColor,
  dataFlow = false,
  contentSx = {},
  fullWidth = false,
  maxWidth = 'sm',
  ...props
}) => {
  const theme = useTheme();
  const dialogAccentColor = accentColor || theme.palette.primary.main;
  
  // Prepare corner clipping for the dialog paper
  const clipPath = cornerClip ? getCornerClipPath('md') : undefined;
  const cornerStyles = cornerClip ? getCornerAccents(theme, 15, dialogAccentColor) : {};
  
  return (
    <AnimatePresence mode="wait">
      {open && (
        <MuiDialog
          open={open}
          onClose={onClose}
          fullWidth={fullWidth}
          maxWidth={maxWidth}
          PaperProps={{
            component: animated ? motion.div : undefined,
            variants: animated ? dialogVariants : undefined,
            initial: animated ? 'hidden' : undefined,
            animate: animated ? 'visible' : undefined,
            exit: animated ? 'exit' : undefined,
            sx: {
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(dialogAccentColor, 0.2)}`,
              overflow: 'hidden',
              position: 'relative',
              clipPath: clipPath,
              ...cornerStyles,
            }
          }}
          {...props}
        >
          {/* Dialog Title */}
          {title && (
            <CyberDialogTitle 
              onClose={onClose} 
              icon={titleIcon}
              accentColor={dialogAccentColor}
            >
              {title}
            </CyberDialogTitle>
          )}
          
          {/* Dialog Content */}
          <CyberDialogContent animated={animated} sx={contentSx}>
            <CyberBase
              scanlineEffect={scanlineEffect}
              cornerClip={false}
              dataFlow={dataFlow}
              accentColor={dialogAccentColor}
              sx={{ position: 'relative' }}
            >
              {children}
            </CyberBase>
          </CyberDialogContent>
          
          {/* Dialog Actions */}
          {actions && (
            <CyberDialogActions>
              {actions}
            </CyberDialogActions>
          )}
        </MuiDialog>
      )}
    </AnimatePresence>
  );
};

// Create a type that includes the sub-components
type CyberDialogComponent = React.FC<CyberDialogProps> & {
  Title: typeof CyberDialogTitle;
  Content: typeof CyberDialogContent;
  Actions: typeof CyberDialogActions;
};

// Cast the component to the type with sub-components
const CyberDialogWithComponents = CyberDialog as CyberDialogComponent;
CyberDialogWithComponents.Title = CyberDialogTitle;
CyberDialogWithComponents.Content = CyberDialogContent;
CyberDialogWithComponents.Actions = CyberDialogActions;

export default CyberDialogWithComponents;
