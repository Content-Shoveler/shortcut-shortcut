import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { 
  Box,
  Container,
  Paper
} from '@mui/material';

// Components
import Header from './components/Header';

// Pages
import TemplateList from './pages/TemplateList';
import TemplateEditor from './pages/TemplateEditor';
import TemplateApply from './pages/TemplateApply';

const App: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Routes>
            <Route path="/" element={<TemplateList />} />
            <Route path="/editor" element={<TemplateEditor />} />
            <Route path="/editor/:id" element={<TemplateEditor />} />
            <Route path="/apply/:id" element={<TemplateApply />} />
          </Routes>
        </Paper>
      </Container>
    </Box>
  );
};

export default App;
