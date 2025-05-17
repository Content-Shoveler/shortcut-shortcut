import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { 
  Box,
  Container,
  Paper,
  alpha,
  duration,
  useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Header from './components/Header';
import { CyberSpinner } from './components/cyberpunk';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import TemplateApply from './pages/TemplateApply';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Animations
import { pageVariants, starFieldVariants, radarScanVariants } from './utils/animations';

// Create motion component versions
const MotionPaper = motion(Paper);
const MotionBox = motion(Box);

const App: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  
  // Keep track of route changes for animations
  React.useEffect(() => {
    // Effect to handle route changes
  }, [location.pathname]);
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        // Space-themed background gradients
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          borderTop: `2px solid ${theme.palette.secondary.main}`,
          borderRight: `2px solid ${theme.palette.secondary.main}`,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.7,
          background: theme.palette.mode === 'dark' 
            ? `radial-gradient(circle at top right, ${alpha(theme.palette.secondary.main, 0.15)}, transparent 70%)`
            : 'none',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '200px',
          height: '200px',
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
          borderLeft: `2px solid ${theme.palette.secondary.main}`,
          pointerEvents: 'none',
          zIndex: 1,
          opacity: 0.7,
          background: theme.palette.mode === 'dark'
            ? `radial-gradient(circle at bottom left, ${alpha(theme.palette.secondary.main, 0.1)}, transparent 70%)`
            : 'none',
        }
      }}
    >
      {/* Star field background for dark mode */}
      {theme.palette.mode === 'dark' && (
        <MotionBox
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, ${alpha('#FFFFFF', 0.4)} 50%, transparent 50%), 
                               radial-gradient(2px 2px at ${Math.random() * 100}% ${Math.random() * 100}%, ${alpha('#00FFFF', 0.4)} 50%, transparent 50%)`,
            backgroundSize: '100px 100px, 200px 200px',
            zIndex: -1,
            opacity: 0.4,
            pointerEvents: 'none',
          }}
          variants={starFieldVariants}
          initial="initial"
          animate="animate"
        />
      )}
      <Header />
      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          mt: 4, 
          mb: 4, 
          flex: 1,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -2,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.secondary.main, 0.6)}, transparent)`,
            pointerEvents: 'none'
          }
        }}
      >
        {/* NASA-inspired radar scan effect */}
        <MotionBox
          sx={{
            position: 'absolute',
            top: '30%',
            right: '35%',
            width: '60vmax',
            height: '60vmax',
            borderRadius: '50%',
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
            opacity: 0.4,
            zIndex: -1,
            pointerEvents: 'none',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '50%',
              height: '1px',
              background: theme.palette.secondary.main,
              transformOrigin: '0 0',
            }
          }}
          variants={radarScanVariants}
          initial="initial"
          animate="animate"
        />
        {/* Always visible loading spinner */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            position: 'absolute',
            top: '-15vmax',
            right: '-15vmax',
            zIndex: -1,
            opacity: '0.2 !important',
          }}
        >
          <CyberSpinner size={90} />
        </MotionBox>
        
        {/* Main content with page transitions */}
        <AnimatePresence mode="wait">
          <MotionPaper 
            key={location.pathname}
            elevation={3} 
            sx={{ 
              p: 3,
              position: 'relative',
              overflow: 'hidden',
              backdropFilter: 'blur(5px)',
              // Terminal/screen styling
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 70%)`,
                backgroundSize: '400% 400%',
                pointerEvents: 'none',
                opacity: 0.8
              },
              // Scan lines
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: theme.palette.mode === 'dark' ?
                  'repeating-linear-gradient(0deg, rgba(95, 158, 160, 0.03) 0px, rgba(95, 158, 160, 0.03) 1px, transparent 1px, transparent 2px)' :
                  'none',
                backgroundSize: '100% 2px',
                pointerEvents: 'none',
                opacity: 0.5,
                zIndex: 0
              }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ type: 'spring', stiffness: 60, damping: 12 }}
          >
            <Routes location={location}>
              <Route path="/" element={<Navigate replace to="/templates" />} />
              <Route path="/templates" element={<TemplateList />} />
              <Route path="/editor" element={<TemplateEditor />} />
              <Route path="/editor/:id" element={<TemplateEditor />} />
              <Route path="/apply/:id" element={<TemplateApply />} />
              <Route path="/settings" element={<Settings />} />
              {/* Wildcard route for 404 page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MotionPaper>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

// Wrap the App component with ErrorBoundary to catch and display any runtime errors
const AppWithErrorBoundary: React.FC = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
