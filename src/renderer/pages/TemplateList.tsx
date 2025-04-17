import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../store/AppProviders';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  alpha,
  Theme,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';
import { motion, AnimatePresence } from 'framer-motion';

import { Template } from '../types';
import { 
  containerVariants, 
  listItemVariants, 
  cardHoverVariants, 
  buttonVariants, 
  dialogVariants
} from '../utils/animations';

// Create motion versions of MUI components
const MotionCard = motion(Card);
const MotionIconButton = motion(IconButton);
const MotionBox = motion(Box);
const MotionPaper = motion(Paper);
const MotionButton = motion(Button);
const MotionTableRow = motion(TableRow);

const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const theme = useTheme();
  const viewMode = settings.appearance.viewMode;
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
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity={alert.type} 
              sx={{ 
                mb: 2,
                borderLeft: alert.type === 'success' 
                  ? '4px solid #39FF14' 
                  : '4px solid #FF3E3E',
              }}
              onClose={() => setAlert(null)}
            >
              {alert.message}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 4,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -10,
            left: '5%',
            width: '90%',
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
          }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1"
          sx={{ 
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '&::before': {
              content: '""',
              display: 'block',
              width: '8px',
              height: '30px',
              background: theme.palette.secondary.main,
              boxShadow: theme.palette.mode === 'dark' ? '0 0 10px rgba(0, 255, 255, 0.7)' : 'none',
            }
          }}
        >
          <motion.span
            animate={{ 
              textShadow: [
                '0 0 0 rgba(0,0,0,0)', 
                '0 0 5px rgba(0,255,255,0.3)', 
                '0 0 0 rgba(0,0,0,0)'
              ]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatType: 'reverse'
            }}
          >
            Epic Templates
          </motion.span>
          <MemoryIcon sx={{ 
            fontSize: 20, 
            ml: 1, 
            opacity: 0.7, 
            color: theme.palette.secondary.main
          }} />
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Import Templates">
            <MotionButton 
              variant="outlined" 
              startIcon={<UploadIcon />}
              onClick={handleImport}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              sx={{
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                }
              }}
            >
              Import
            </MotionButton>
          </Tooltip>
          
          <Tooltip title="Export Templates">
            <MotionButton 
              variant="outlined" 
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={templates.length === 0}
              variants={buttonVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              sx={{
                borderColor: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.secondary.main,
                  backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                }
              }}
            >
              Export
            </MotionButton>
          </Tooltip>
        </Stack>
      </Box>

      <AnimatePresence mode="wait">
        {templates.length === 0 ? (
          <MotionBox 
            sx={{ textAlign: 'center', py: 5 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box 
              sx={{ 
                position: 'relative',
                mb: 3,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '35%',
                  width: '30%',
                  height: '1px',
                  background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.primary.main, 0.3)}, transparent)`,
                }
              }}
            >
              <CodeIcon 
                sx={{ 
                  fontSize: 60, 
                  opacity: 0.3,
                  color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.main
                }} 
              />
            </Box>
            <Typography 
              variant="body1" 
              color="text.secondary" 
              gutterBottom
              sx={{ maxWidth: '500px', mx: 'auto', mb: 3 }}
            >
              No templates found. Create your first template to get started with your Shortcut workflow.
            </Typography>
            <MotionButton 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => navigate('/editor')}
              sx={{ mt: 2 }}
              whileHover={{ 
                scale: 1.05, 
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 0 15px rgba(0, 255, 255, 0.5)' 
                  : '0 5px 15px rgba(95, 158, 160, 0.3)'
              }}
              whileTap={{ scale: 0.98 }}
            >
              Create Template
            </MotionButton>
          </MotionBox>
        ) : viewMode === 'card' ? (
          /* Card View */
          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              margin: -1,
              position: 'relative',
              zIndex: 1
            }}
          >
            {templates.map((template, index) => (
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
                <Card
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'visible',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.25)}`
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '15px',
                      height: '15px',
                      borderTop: `2px solid ${theme.palette.secondary.main}`,
                      borderRight: `2px solid ${theme.palette.secondary.main}`,
                      zIndex: 1
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '15px',
                      height: '15px',
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      borderLeft: `2px solid ${theme.palette.primary.main}`,
                      zIndex: 1
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, pt: 2 }}>
                    <Typography 
                      variant="h6" 
                      component="h2" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 2
                      }}
                    >
                      {template.name}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      gutterBottom
                      sx={{ minHeight: '40px' }}
                    >
                      {template.description}
                    </Typography>
                    <Divider sx={{ 
                      my: 2,
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      '&::before, &::after': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }} />
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 1
                    }}>
                      <Chip 
                        size="small" 
                        label={`${template.storyTemplates.length} Stories`}
                        sx={{ 
                          borderRadius: '4px',
                          background: alpha(theme.palette.primary.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      />
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.7rem',
                          opacity: 0.7
                        }}
                      >
                        ID: {template.id.substring(0, 8)}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 500 }}>
                        Variables:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {template.variables.map(variable => (
                          <Chip
                            key={variable}
                            size="small"
                            label={variable}
                            variant="outlined"
                            sx={{ 
                              borderRadius: '4px',
                              borderColor: theme.palette.secondary.main,
                              fontSize: '0.7rem'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ 
                    justifyContent: 'space-between',
                    borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    p: 1
                  }}>
                    <Box>
                      <Tooltip title="Apply Template">
                        <MotionIconButton 
                          color="primary"
                          onClick={() => navigate(`/apply/${template.id}`)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <PlayArrowIcon />
                        </MotionIconButton>
                      </Tooltip>
                      <Tooltip title="Edit Template">
                        <MotionIconButton
                          color="primary"
                          onClick={() => navigate(`/editor/${template.id}`)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <EditIcon />
                        </MotionIconButton>
                      </Tooltip>
                    </Box>
                    <Tooltip title="Delete Template">
                      <MotionIconButton 
                        color="error"
                        onClick={() => handleDeleteClick(template.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <DeleteIcon />
                      </MotionIconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        ) : (
          /* List View */
          <MotionPaper 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            sx={{ 
              mt: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
              backdropFilter: 'blur(10px)',
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.main}, ${theme.palette.primary.dark})`,
                opacity: 0.7
              }
            }}
          >
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ 
                    background: alpha(theme.palette.primary.main, 0.05),
                    '& th': {
                      fontWeight: 'bold',
                      color: theme.palette.text.primary,
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                    }
                  }}>
                    <TableCell>Name</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Stories</TableCell>
                    <TableCell>Variables</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template, index) => (
                    <MotionTableRow 
                      key={template.id} 
                      hover
                      variants={listItemVariants}
                      custom={index}
                      whileHover={{ 
                        backgroundColor: alpha(theme.palette.secondary.main, 0.05)
                      }}
                      sx={{ 
                        '& td': {
                          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      }}
                    >
                      <TableCell component="th" scope="row">
                        <Typography 
                          variant="subtitle1"
                          sx={{ fontWeight: 500 }}
                        >
                          {template.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          noWrap 
                          sx={{ maxWidth: 300 }}
                        >
                          {template.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          size="small" 
                          label={template.storyTemplates.length}
                          sx={{ 
                            borderRadius: '4px',
                            background: alpha(theme.palette.primary.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            minWidth: '30px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {template.variables.map((variable) => (
                            <Chip 
                              key={variable} 
                              label={variable} 
                              size="small" 
                              variant="outlined"
                              sx={{ 
                                borderRadius: '4px',
                                borderColor: alpha(theme.palette.secondary.main, 0.5),
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Apply Template">
                          <MotionIconButton 
                            color="primary"
                            onClick={() => navigate(`/apply/${template.id}`)}
                            size="small"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <PlayArrowIcon />
                          </MotionIconButton>
                        </Tooltip>
                        <Tooltip title="Edit Template">
                          <MotionIconButton
                            color="primary"
                            onClick={() => navigate(`/editor/${template.id}`)}
                            size="small"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <EditIcon />
                          </MotionIconButton>
                        </Tooltip>
                        <Tooltip title="Delete Template">
                          <MotionIconButton 
                            color="error"
                            onClick={() => handleDeleteClick(template.id)}
                            size="small"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <DeleteIcon />
                          </MotionIconButton>
                        </Tooltip>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MotionPaper>
        )}
      </AnimatePresence>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '30px',
              height: '30px',
              borderTop: `2px solid ${alpha(theme.palette.error.main, 0.7)}`,
              borderRight: `2px solid ${alpha(theme.palette.error.main, 0.7)}`,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '30px',
              height: '30px',
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          '&::before': {
            content: '""',
            display: 'block',
            width: '4px',
            height: '20px',
            background: theme.palette.error.main,
          }
        }}>
          Delete Template
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText sx={{ opacity: 0.8 }}>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, 
          px: 3, 
          py: 2 
        }}>
          <MotionButton 
            onClick={() => setDeleteDialogOpen(false)}
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
          >
            Cancel
          </MotionButton>
          <MotionButton 
            onClick={confirmDelete} 
            color="error" 
            variants={buttonVariants}
            initial="rest"
            whileHover="hover"
            whileTap="tap"
            autoFocus
            sx={{
              backgroundColor: alpha(theme.palette.error.main, 0.9),
            }}
          >
            Delete
          </MotionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateList;
