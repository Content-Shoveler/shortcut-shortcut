import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Grid,
  alpha,
  useTheme,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExtensionIcon from '@mui/icons-material/Extension';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';

import { 
  CyberButton, 
  CyberCard, 
  CyberTextField, 
  CyberIcon 
} from '../components/cyberpunk';

import { Template } from '../types';
import * as templatesService from '../services/templatesService';
import { useShortcutApi } from '../hooks/useShortcutApi';

// Define type for variable mapping
interface VariableMapping {
  [key: string]: string;
}

// Animation variants for the preview cards
const previewCardVariants = {
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

// Helper component for animated epic preview
interface EpicPreviewProps {
  name: string;
  description: string;
  state: string;
}

const EpicPreview: React.FC<EpicPreviewProps> = ({ 
  name, 
  description, 
  state 
}) => {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={previewCardVariants}
      initial="initial"
      whileHover="hover"
      style={{ borderRadius: 4 }}
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
          pb: 1,
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

        {/* Header with title */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          position: 'relative',
          zIndex: 1
        }}>
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
            {name || '(Unnamed Epic)'}
          </Typography>
        </Box>

        {/* Content section with description and state */}
        <Box sx={{ p: 1.5, position: 'relative', zIndex: 1 }}>
          {/* State badge */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: description ? 1.5 : 0, gap: 1 }}>
            {state && (
              <Chip 
                icon={<CyberIcon icon={AssignmentIcon} size={16} />}
                label={state}
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
            )}
          </Box>
          
          {/* Description */}
          {description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(theme.palette.text.primary, 0.9),
                fontSize: '0.9rem',
                fontFamily: "'Share Tech Mono', monospace",
                backgroundColor: alpha(theme.palette.background.default, 0.4),
                p: 1,
                borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

// Helper component for animated story preview
interface StoryPreviewProps {
  story: {
    name: string;
    description: string;
    type: string;
    state: string;
    estimate?: number;
  };
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ story }) => {
  const theme = useTheme();
  
  // Helper to get the appropriate icon and color for the story type
  const getTypeInfo = useMemo(() => {
    switch(story.type) {
      case 'bug':
        return { 
          icon: BugReportIcon, 
          color: theme.palette.error.main,
          label: 'Bug'
        };
      case 'chore':
        return { 
          icon: BuildIcon, 
          color: theme.palette.info.main,
          label: 'Chore'
        };
      case 'feature':
      default:
        return { 
          icon: ExtensionIcon, 
          color: theme.palette.success.main,
          label: 'Feature'
        };
    }
  }, [story.type, theme]);

  return (
    <motion.div
      variants={previewCardVariants}
      initial="initial"
      whileHover="hover"
      style={{ borderRadius: 4 }}
    >
      <Box 
        sx={{
          position: 'relative',
          border: `1px solid ${alpha(getTypeInfo.color, 0.5)}`,
          borderRadius: '2px',
          overflow: 'hidden',
          background: alpha(theme.palette.background.paper, 0.7),
          clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
          transition: 'all 0.3s ease',
          pb: 1,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '12px',
            height: '12px',
            borderTop: `2px solid ${getTypeInfo.color}`,
            borderRight: `2px solid ${getTypeInfo.color}`,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '12px',
            height: '12px',
            borderBottom: `2px solid ${getTypeInfo.color}`,
            borderLeft: `2px solid ${getTypeInfo.color}`,
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
            background: `linear-gradient(90deg, transparent 0%, ${alpha(getTypeInfo.color, 0.2)} 50%, transparent 100%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Header with story type, name and actions */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 1.5,
          borderBottom: `1px solid ${alpha(getTypeInfo.color, 0.2)}`,
          backgroundColor: alpha(getTypeInfo.color, 0.05),
          position: 'relative',
          zIndex: 1
        }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 0.5,
              mr: 1.5,
              borderRadius: '4px',
              backgroundColor: alpha(getTypeInfo.color, 0.1),
              border: `1px solid ${alpha(getTypeInfo.color, 0.3)}`,
            }}
          >
            <CyberIcon 
              icon={getTypeInfo.icon} 
              size={22} 
              color={getTypeInfo.color} 
              glowIntensity={0.7} 
            />
          </Box>

          <Typography 
            variant="h6" 
            sx={{ 
              flex: 1,
              fontFamily: "'Rajdhani', sans-serif",
              fontWeight: 600,
              fontSize: '1.1rem',
              letterSpacing: '0.02em',
              textShadow: `0 0 8px ${alpha(getTypeInfo.color, 0.4)}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {story.name || '(Unnamed Story)'}
          </Typography>
        </Box>

        {/* Content section with description and metadata */}
        <Box sx={{ p: 1.5, position: 'relative', zIndex: 1 }}>
          {/* Status and metadata badges */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: story.description ? 1.5 : 0, gap: 1 }}>
            {story.state && (
              <Chip 
                icon={<CyberIcon icon={AssignmentIcon} size={16} />}
                label={story.state}
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
            )}
            
            {story.estimate !== undefined && story.estimate > 0 && (
              <Chip 
                icon={<CyberIcon icon={TimerIcon} size={16} />}
                label={`${story.estimate} points`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                  borderRadius: '4px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: theme.palette.secondary.main
                  }
                }}
              />
            )}
          </Box>
          
          {/* Description */}
          {story.description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: alpha(theme.palette.text.primary, 0.9),
                fontSize: '0.9rem',
                fontFamily: "'Share Tech Mono', monospace",
                backgroundColor: alpha(theme.palette.background.default, 0.4),
                p: 1,
                borderLeft: `2px solid ${alpha(getTypeInfo.color, 0.5)}`,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
              }}
            >
              {story.description.length > 120 
                ? `${story.description.substring(0, 120)}...` 
                : story.description}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

// Function to replace variables in text with actual values
const replaceVariables = (text: string, variables: VariableMapping): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};

const TemplateApply: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const shortcutApi = useShortcutApi();

  // State management
  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<VariableMapping>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  
  // Load template on component mount
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) return;
      
      try {
        const templates = await templatesService.getAllTemplates();
        const foundTemplate = templates.find((t: Template) => t.id === id);
        
        if (foundTemplate) {
          setTemplate(foundTemplate);
          
          // Initialize variable values with empty strings
          const initialValues: VariableMapping = {};
          foundTemplate.variables.forEach(variable => {
            initialValues[variable] = '';
          });
          setVariableValues(initialValues);
        } else {
          setAlert({
            type: 'error',
            message: 'Template not found',
          });
          navigate('/');
        }
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Failed to load template',
        });
      }
    };

    loadTemplate();
  }, [id, navigate]);

  // Navigate to settings page
  const navigateToSettings = () => {
    navigate('/settings');
  };

  // Handle variable input changes
  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value,
    }));
  };

  // Handle template application
  const handleApplyTemplate = async () => {
    if (!template) return;
    
    // Validate variables
    const missingVariables = template.variables.filter(v => !variableValues[v]);
    if (missingVariables.length > 0) {
      setAlert({
        type: 'error',
        message: `Please fill in all variables: ${missingVariables.join(', ')}`,
      });
      return;
    }
    
    setLoading(true);
    setAlert(null);
    
    try {
      // Build the epic with replaced variables
      const epicName = replaceVariables(template.epicDetails.name, variableValues);
      const epicDescription = replaceVariables(template.epicDetails.description, variableValues);
      
      // Build stories with replaced variables - making sure we match expected types
      const stories = template.storyTemplates.map(story => {
        // Process tasks if they exist, applying variable replacement to each task description
        const processedTasks = story.tasks?.map(task => ({
          ...task,
          description: replaceVariables(task.description, variableValues)
        }));
        
        // Create a properly typed object with exact fields expected by the API
        const storyPayload = {
          name: replaceVariables(story.name, variableValues),
          description: replaceVariables(story.description, variableValues),
          type: story.type,
          state: story.state,
          workflow_state_id: story.workflow_state_id,
          estimate: story.estimate,
          owner_ids: story.owner_ids,
          // Explicitly convert iteration_id to number when it exists
          iteration_id: story.iteration_id ? Number(story.iteration_id) : undefined,
          // Include the processed tasks with variable replacement
          tasks: processedTasks
        };
        
        return storyPayload;
      });
      
      // Find a workflowId from the first story with one, or use a default
      const workflowId = template.storyTemplates.find(s => s.workflow_id)?.workflow_id || '';
      if (!workflowId) {
        throw new Error('No workflow ID found in any story template');
      }
      
      // Create the epic with stories in Shortcut
      const result = await shortcutApi.createEpicWithStories(
        {
          ...template.epicDetails,  // Include ALL fields from the template
          name: epicName,           // Override just the fields that need variable replacement
          description: epicDescription
        },
        workflowId,
        stories
      );
      
      setAlert({
        type: 'success',
        message: `Template applied successfully! Epic #${result.epicId} and ${result.storyIds.length} stories created in Shortcut.`,
      });
      
      // Navigate back to templates list after success
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to apply template to Shortcut';
        
      // Show specific message for API token issues
      const message = errorMessage.includes('API token') || errorMessage.includes('401') || errorMessage.includes('403')
        ? 'Invalid API token. Please update your Shortcut API token in Settings.'
        : errorMessage;
        
      setAlert({
        type: 'error',
        message
      });
    } finally {
      setLoading(false);
    }
  };

  // Render loading state if template is not loaded yet
  if (!template) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Generate preview content
  const previewEpicName = replaceVariables(template.epicDetails.name, variableValues);
  const previewEpicDescription = replaceVariables(template.epicDetails.description, variableValues);
  const previewStories = template.storyTemplates.map(story => ({
    name: replaceVariables(story.name, variableValues),
    description: replaceVariables(story.description, variableValues),
    type: story.type,
    state: story.state,
    estimate: story.estimate
    // Removed labels property
  }));

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

      {/* API Token Status Alert - Only shown when shortcutApi.hasApiToken is false */}
      {!shortcutApi.hasApiToken && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2, display: 'flex', alignItems: 'center' }}
          action={
            <CyberButton
              variant="outlined"
              size="small"
              startIcon={<CyberIcon icon={SettingsIcon} size={16} />}
              onClick={navigateToSettings}
              scanlineEffect
              glowIntensity={0.6}
              sx={{ ml: 1 }}
            >
              Settings
            </CyberButton>
          }
        >
          Configure your Shortcut API Token to apply templates
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Apply Epic: {template.epicDetails.name}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <CyberButton 
            variant="outlined" 
            startIcon={<CyberIcon icon={ArrowBackIcon} size={20} />}
            onClick={() => navigate('/')}
            scanlineEffect
          >
            Back
          </CyberButton>
          <CyberButton 
            variant="outlined"
            startIcon={<CyberIcon icon={SendIcon} size={20} />}
            onClick={handleApplyTemplate}
            disabled={
              loading || 
              template.variables.some(v => !variableValues[v])
            }
            scanlineEffect
          >
            {loading ? <CircularProgress size={24} /> : 'Apply Template'}
          </CyberButton>
        </Stack>
      </Box>


      {/* Variables Section */}
      <CyberCard sx={{ p: 3, mb: 3 }} title="Fill in Variables" cornerAccent glowOnHover>
        {template.variables.length === 0 ? (
          <Typography color="text.secondary">
            This template has no variables to fill in.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {template.variables.map(variable => (
              <CyberTextField
                key={variable}
                label={variable}
                value={variableValues[variable] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleVariableChange(variable, e.target.value)}
                fullWidth
                required
                cornerClip
              />
            ))}
          </Box>
        )}
      </CyberCard>

      {/* Preview Section */}
      <CyberCard sx={{ p: 3, mb: 3 }} title="Preview" cornerAccent glowOnHover>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Epic
          </Typography>
          <EpicPreview 
            name={previewEpicName || '(Epic Name)'}
            description={previewEpicDescription || '(Epic Description)'}
            state={template.epicDetails.state}
          />
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Stories ({previewStories.length})
        </Typography>
        
        {previewStories.length === 0 ? (
          <Typography color="text.secondary">
            No stories in this template.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
            {previewStories.map((story, index) => (
              <Box key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, padding: 1 }}>
                <StoryPreview story={story} />
              </Box>
            ))}
          </Box>
        )}
      </CyberCard>
    </Box>
  );
};

export default TemplateApply;
