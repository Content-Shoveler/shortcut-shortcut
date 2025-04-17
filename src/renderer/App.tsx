import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { 
  Box,
  Container,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

// Components
import Header from './components/Header';

// Pages
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import TemplateApply from './pages/TemplateApply';
import Settings from './pages/Settings';

// Animations
import { pageVariants } from './utils/animations';

// Create a motion component version of Paper
const MotionPaper = motion(Paper);

const App: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100px',
          height: '100px',
          borderTop: `2px solid ${theme.palette.secondary.main}`,
          borderRight: `2px solid ${theme.palette.secondary.main}`,
          pointerEvents: 'none',
          zIndex: 1
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100px',
          height: '100px',
          borderBottom: `2px solid ${theme.palette.secondary.main}`,
          borderLeft: `2px solid ${theme.palette.secondary.main}`,
          pointerEvents: 'none',
          zIndex: 1
        }
      }}
    >
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
            top: -10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '70%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.5)}, transparent)`,
            pointerEvents: 'none'
          }
        }}
      >
        <AnimatePresence mode="wait">
          <MotionPaper 
            key={location.pathname}
            elevation={3} 
            sx={{ 
              p: 3,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at 30% 30%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
                pointerEvents: 'none'
              }
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
          >
            <Routes location={location}>
              <Route path="/" element={<TemplateList />} />
              <Route path="/editor" element={<TemplateEditor />} />
              <Route path="/editor/:id" element={<TemplateEditor />} />
              <Route path="/apply/:id" element={<TemplateApply />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </MotionPaper>
        </AnimatePresence>
      </Container>
    </Box>
  );
};

export default App;
