import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../store/SettingsContext';
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
  ButtonGroup,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import CodeIcon from '@mui/icons-material/Code';
import MemoryIcon from '@mui/icons-material/Memory';
import { motion, AnimatePresence } from 'framer-motion';
import { CyberButton, CyberCard, CyberIcon } from '../components/cyberpunk';

import { Template } from '../types';
import * as webUtils from '../utils/webUtils';
import { 
  containerVariants, 
  listItemVariants, 
  cardHoverVariants, 
  buttonVariants, 
  dialogVariants
} from '../utils/animations';

// Animation variants for the template cards
const templateCardVariants = {
  initial: { 
    scale: 1,
    boxShadow: '0 0 0px rgba(0, 0, 0, 0)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 0 20px rgba(0, 255, 255, 0.2)',
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

// Animation variants for the data flow effect
const dataFlowVariants = {
  initial: {
    opacity: 0,
    x: '-100%'
  },
  animate: {
    opacity: 0.2,
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear'
    }
  }
};

// Helper component for animated template preview card
interface TemplateCardProps {
  template: Template;
  onApply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ 
  template, 
  onApply, 
  onEdit, 
  onDelete,
  onDuplicate
}) => {
  const theme = useTheme();
  
  return (
  <motion.div
    variants={templateCardVariants}
    initial="initial"
    whileHover="hover"
    style={{ borderRadius: 4, height: '100%' }}
  >
    <Box 
      sx={{
        position: 'relative',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
        borderRadius: '2px',
        overflow: 'hidden',
        background: alpha(theme.palette.background.paper, 0.7),
        clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
        transition: 'all 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: 0,
          width: '12px',
          height: '12px',
          borderTop: `2px solid ${theme.palette.primary.main}`,
          borderRight: `2px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '12px',
          height: '12px',
          borderBottom: `2px solid ${theme.palette.primary.main}`,
          borderLeft: `2px solid ${theme.palette.primary.main}`,
          zIndex: 1,
        }
      }}
    >
      {/* Data flow animation effect */}
      <motion.div
        variants={dataFlowVariants}
        initial="initial"
        whileHover="animate"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          background: `linear-gradient(90deg, transparent 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, transparent 100%)`,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Header with title and badge */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 1.5,
        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.05),
        position: 'relative',
        zIndex: 1
      }}>
        <Tooltip title="Epic">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              mr: 1.5,
              borderRadius: '4px',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <CyberIcon 
              icon={MemoryIcon} 
              size={22} 
              color={theme.palette.primary.main} 
              glowIntensity={0.7} 
            />
          </Box>
        </Tooltip>
        
        <Typography 
          variant="h6" 
          sx={{ 
            flex: 1,
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 600,
            fontSize: '1.1rem',
            letterSpacing: '0.02em',
            textShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.4)}`,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {template.epicDetails.name || template.name || '(Unnamed Epic)'}
        </Typography>
      </Box>

      {/* Content section */}
      <Box sx={{ p: 1.5, position: 'relative', zIndex: 1, flexGrow: 1 }}>
        {/* Stats badges */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Chip 
            icon={<CyberIcon icon={CodeIcon} size={16} />}
            label={`${template.storyTemplates.length} Stories`}
            size="small"
            sx={{ 
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              borderRadius: '4px',
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 500,
              '& .MuiChip-icon': {
                color: theme.palette.primary.main
              }
            }}
          />
        </Box>
        
        {/* Variables section with improved styling */}
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            display: 'block', 
            mb: 1, 
            color: theme.palette.text.secondary,
            textTransform: 'uppercase',
            fontSize: '0.65rem',
            letterSpacing: '0.05em'
          }}
        >
          Variables:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
          {template.variables.length > 0 ? (
            template.variables.map(variable => (
              <Chip 
                key={variable}
                label={variable}
                size="small"
                variant="outlined"
                sx={{ 
                  height: '20px',
                  fontSize: '0.7rem',
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  borderRadius: '4px',
                }}
              />
            ))
          ) : (
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                opacity: 0.7,
                fontStyle: 'italic',
                fontSize: '0.7rem'
              }}
            >
              No variables defined
            </Typography>
          )}
        </Box>
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 2, 
            color: 'text.secondary', 
            fontSize: '0.7rem',
            fontFamily: "'Share Tech Mono', monospace",
            opacity: 0.6 
          }}
        >
          ID: {template.id.substring(0, 8)}
        </Typography>
      </Box>
      
      {/* Actions */}
      <Box sx={{ 
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        p: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        backgroundColor: alpha(theme.palette.background.paper, 0.4),
        position: 'relative',
        zIndex: 1
      }}>
        <Box>
          <Tooltip title="Apply Template">
            <IconButton 
              size="small" 
              onClick={onApply}
              sx={{ 
                mr: 0.5,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.success.main, 0.1) 
                }
              }}
            >
              <CyberIcon icon={PlayArrowIcon} size={20} color={theme.palette.success.main} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Template">
            <IconButton 
              size="small" 
              onClick={onEdit}
              sx={{ 
                mr: 0.5,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                } 
              }}
            >
              <CyberIcon icon={EditIcon} size={20} color={theme.palette.primary.main} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Duplicate Template">
            <IconButton 
              size="small" 
              onClick={onDuplicate}
              sx={{ 
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.info.main, 0.1) 
                } 
              }}
            >
              <CyberIcon icon={ContentCopyIcon} size={20} color={theme.palette.info.main} />
            </IconButton>
          </Tooltip>
        </Box>
        <Tooltip title="Delete Template">
          <IconButton 
            size="small" 
            onClick={onDelete}
            sx={{ 
              '&:hover': { 
                backgroundColor: alpha(theme.palette.error.main, 0.1) 
              } 
            }}
          >
            <CyberIcon icon={DeleteIcon} size={20} color={theme.palette.error.main} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  </motion.div>
  );
};

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
        const fetchedTemplates = await webUtils.getTemplates();
        setTemplates(fetchedTemplates);
      } catch (error) {
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
  
  // Handle template duplication
  const handleDuplicateTemplate = (templateId: string) => {
    // Find the template to duplicate
    const templateToDuplicate = templates.find(t => t.id === templateId);
    
    if (templateToDuplicate) {
      // Create a deep copy of the template
      const duplicatedTemplate = JSON.parse(JSON.stringify(templateToDuplicate));
      
      // Generate a new ID and update the name
      duplicatedTemplate.id = `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
      duplicatedTemplate.epicDetails.name = `${duplicatedTemplate.epicDetails.name || 'Template'} (Copy)`;
      
      // Add the duplicate to the templates list
      setTemplates([...templates, duplicatedTemplate]);
      
      // Save the duplicate to storage
      webUtils.saveTemplate(duplicatedTemplate)
        .then(() => {
          setAlert({
            type: 'success',
            message: 'Template duplicated successfully.',
          });
        })
        .catch(() => {
          setAlert({
            type: 'error',
            message: 'Failed to save duplicated template.',
          });
        });
    }
  };

  const confirmDelete = async () => {
    if (templateToDelete) {
      try {
        await webUtils.deleteTemplate(templateToDelete);
        setTemplates(templates.filter(t => t.id !== templateToDelete));
        setAlert({
          type: 'success',
          message: 'Template deleted successfully.',
        });
      } catch (error) {
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
      const result = await webUtils.exportTemplates();
      if (result) {
        setAlert({
          type: 'success',
          message: 'Templates exported successfully.',
        });
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Failed to export templates.',
      });
    }
  };

  // Handle template import
  const handleImport = async () => {
    try {
      const importedTemplates = await webUtils.importTemplates();
      if (importedTemplates) {
        setTemplates(importedTemplates);
        setAlert({
          type: 'success',
          message: 'Templates imported successfully.',
        });
      }
    } catch (error) {
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
            Epics
          </motion.span>
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title="Import Templates">
            <CyberButton 
              variant="outlined" 
              startIcon={<CyberIcon icon={UploadIcon} size={20} />}
              onClick={handleImport}
              scanlineEffect
            >
              Import
            </CyberButton>
          </Tooltip>
          
          <Tooltip title="Export Templates">
            <CyberButton 
              variant="outlined" 
              startIcon={<CyberIcon icon={DownloadIcon} size={20} />}
              onClick={handleExport}
              disabled={templates.length === 0}
              scanlineEffect
            >
              Export
            </CyberButton>
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
            <CyberButton 
              variant="outlined" 
              startIcon={<CyberIcon icon={EditIcon} size={20} />}
              onClick={() => navigate('/editor')}
              sx={{ mt: 2 }}
              scanlineEffect
            >
              Create Epic
            </CyberButton>
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
                <TemplateCard 
                  template={template}
                  onApply={() => navigate(`/apply/${template.id}`)}
                  onEdit={() => navigate(`/editor/${template.id}`)}
                  onDelete={() => handleDeleteClick(template.id)}
                  onDuplicate={() => handleDuplicateTemplate(template.id)}
                />
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
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)',
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="40%">Epic Name</TableCell>
                    <TableCell width="20%">Variables</TableCell>
                    <TableCell width="15%">Stories</TableCell>
                    <TableCell width="25%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {templates.map((template) => (
                    <MotionTableRow 
                      key={template.id}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body1" fontWeight="bold">
                          {template.epicDetails.name || template.name || '(Unnamed Epic)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {template.variables.length > 0 ? (
                            template.variables.map((variable, index) => (
                              index < 3 ? (
                                <Chip 
                                  key={variable}
                                  label={variable}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    height: '20px',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              ) : index === 3 ? (
                                <Chip 
                                  key="more"
                                  label={`+${template.variables.length - 3} more`}
                                  size="small"
                                  sx={{ 
                                    height: '20px',
                                    fontSize: '0.7rem',
                                  }}
                                />
                              ) : null
                            ))
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              None
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          icon={<CodeIcon fontSize="small" />}
                          label={template.storyTemplates.length}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <ButtonGroup>
                          <MotionIconButton 
                            size="small"
                            onClick={() => navigate(`/apply/${template.id}`)}
                            variants={buttonVariants}
                            whileHover="hover"
                            title="Apply Template"
                            sx={{ color: theme.palette.success.main }}
                          >
                            <PlayArrowIcon fontSize="small" />
                          </MotionIconButton>
                          <MotionIconButton 
                            size="small"
                            onClick={() => navigate(`/editor/${template.id}`)}
                            variants={buttonVariants}
                            whileHover="hover"
                            title="Edit Template"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <EditIcon fontSize="small" />
                          </MotionIconButton>
                          <MotionIconButton 
                            size="small"
                            onClick={() => handleDuplicateTemplate(template.id)}
                            variants={buttonVariants}
                            whileHover="hover"
                            title="Duplicate Template"
                            sx={{ color: theme.palette.info.main }}
                          >
                            <ContentCopyIcon fontSize="small" />
                          </MotionIconButton>
                          <MotionIconButton 
                            size="small"
                            onClick={() => handleDeleteClick(template.id)}
                            variants={buttonVariants}
                            whileHover="hover"
                            title="Delete Template"
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon fontSize="small" />
                          </MotionIconButton>
                        </ButtonGroup>
                      </TableCell>
                    </MotionTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </MotionPaper>
        )}
      </AnimatePresence>
      
      {/* Confirmation dialog for deleting templates */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          style: { borderRadius: 8, overflow: 'hidden' }
        }}
      >
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this template? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TemplateList;
