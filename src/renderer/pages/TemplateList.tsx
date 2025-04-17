import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Alert,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

import { Template } from '../types';

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await window.electronAPI.getTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setAlert({
          type: 'error',
          message: 'Failed to load templates.',
        });
      }
    };

    fetchTemplates();
  }, []);

  // Handle template deletion
  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        await window.electronAPI.deleteTemplate(templateToDelete);
        setTemplates(templates.filter(t => t.id !== templateToDelete));
        setAlert({
          type: 'success',
          message: 'Template deleted successfully.',
        });
      } catch (error) {
        console.error('Error deleting template:', error);
        setAlert({
          type: 'error',
          message: 'Failed to delete template.',
        });
      }
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Handle template export
  const handleExport = async () => {
    try {
      const result = await window.electronAPI.exportTemplates();
      if (result) {
        setAlert({
          type: 'success',
          message: 'Templates exported successfully.',
        });
      }
    } catch (error) {
      console.error('Error exporting templates:', error);
      setAlert({
        type: 'error',
        message: 'Failed to export templates.',
      });
    }
  };

  // Handle template import
  const handleImport = async () => {
    try {
      const importedTemplates = await window.electronAPI.importTemplates();
      if (importedTemplates) {
        setTemplates(importedTemplates);
        setAlert({
          type: 'success',
          message: 'Templates imported successfully.',
        });
      }
    } catch (error) {
      console.error('Error importing templates:', error);
      setAlert({
        type: 'error',
        message: 'Failed to import templates.',
      });
    }
  };

  return (
    <Box>
      {alert && (
        <Alert 
          severity={alert.type} 
          sx={{ mb: 2 }}
          onClose={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Epic Templates
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Import Templates">
            <Button 
              variant="outlined" 
              startIcon={<UploadIcon />}
              onClick={handleImport}
            >
              Import
            </Button>
          </Tooltip>
          
          <Tooltip title="Export Templates">
            <Button 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={templates.length === 0}
            >
              Export
            </Button>
          </Tooltip>
        </Stack>
      </Box>

      {templates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No templates found. Create your first template to get started.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />}
            onClick={() => navigate('/editor')}
            sx={{ mt: 2 }}
          >
            Create Template
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
          {templates.map((template) => (
            <Box 
              key={template.id}
              sx={{ 
                width: { 
                  xs: '100%', 
                  sm: '50%', 
                  md: '33.33%' 
                },
                padding: 1
              }}
            >
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2">
                    {template.storyTemplates.length} Stories
                  </Typography>
                  <Typography variant="body2">
                    Variables: {template.variables.join(', ')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Tooltip title="Apply Template">
                    <IconButton 
                      color="primary"
                      onClick={() => navigate(`/apply/${template.id}`)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Template">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/editor/${template.id}`)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Template">
                    <IconButton 
                      color="error"
                      onClick={() => handleDeleteClick(template.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateList;
