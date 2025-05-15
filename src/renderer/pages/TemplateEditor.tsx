import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as webUtils from '../utils/webUtils';
import {
  Box,
  Typography,
  Alert,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { v4 as uuidv4 } from 'uuid';
import { 
  CyberCard, 
  CyberTextField, 
  CyberButton, 
  CyberIcon 
} from '../components/cyberpunk';

import { Template, StoryTemplate } from '../types';
import {
  EpicDetailsEditor,
  StoryTemplatesList,
  VariablesManager
} from '../components/TemplateEditorComponents';

// Function to extract variables from a text string
const extractVariables = (text: string): string[] => {
  const matches = text.match(/{{(.*?)}}/g) || [];
  return matches.map(match => match.replace('{{', '').replace('}}', ''))
    .filter((value, index, self) => self.indexOf(value) === index);
};

const TemplateEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [template, setTemplate] = useState<Template>({
    id: id || uuidv4(),
    name: '',
    description: '',
    epicDetails: {
      name: '',
      description: '',
      state: 'to do',
    },
    storyTemplates: [],
    variables: [],
  });
  
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load template if ID is provided
  useEffect(() => {
    const loadTemplate = async () => {
      if (id) {
        try {
          const templates = await webUtils.getTemplates();
          const foundTemplate = templates.find(t => t.id === id);
          
          if (foundTemplate) {
            setTemplate(foundTemplate);
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
      }
    };

    loadTemplate();
  }, [id, navigate]);

  // Update variables whenever epic or story details change
  useEffect(() => {
    const epicVariables = extractVariables(template.epicDetails.name + template.epicDetails.description);
    
    const storyVariables = template.storyTemplates.flatMap(story => 
      extractVariables(story.name + story.description)
    );
    
    const allVariables = [...epicVariables, ...storyVariables]
      .filter((value, index, self) => self.indexOf(value) === index);
    
    setTemplate(prev => ({
      ...prev,
      variables: allVariables,
    }));
  }, [template.epicDetails, template.storyTemplates]);

  // Template details change handlers
  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Epic details change handler
  const handleEpicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      epicDetails: {
        ...prev.epicDetails,
        [name]: value,
      },
    }));
  };

  // Handle epic state change (different event type)
  const handleEpicStateChange = (e: { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setTemplate(prev => ({
      ...prev,
      epicDetails: {
        ...prev.epicDetails,
        [name]: value as string,
      },
    }));
  };

  // Story handlers
  const handleAddStory = (story: StoryTemplate) => {
    setTemplate(prev => ({
      ...prev,
      storyTemplates: [...prev.storyTemplates, story],
    }));
  };

  const handleUpdateStory = (index: number, story: StoryTemplate) => {
    const updatedStories = [...template.storyTemplates];
    updatedStories[index] = story;
    
    setTemplate(prev => ({
      ...prev,
      storyTemplates: updatedStories,
    }));
  };

  const handleDeleteStory = (index: number) => {
    const updatedStories = [...template.storyTemplates];
    updatedStories.splice(index, 1);
    
    setTemplate(prev => ({
      ...prev,
      storyTemplates: updatedStories,
    }));
  };

  // Variable handlers
  const handleAddVariable = (variable: string) => {
    if (!template.variables.includes(variable)) {
      setTemplate(prev => ({
        ...prev,
        variables: [...prev.variables, variable],
      }));
    }
  };

  const handleRemoveVariable = (variable: string) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable),
    }));
  };

  // Auto-save effect
  useEffect(() => {
    // Only save if template has required fields
    if (template.epicDetails.name) {
      const saveTimeout = setTimeout(async () => {
        try {
          await webUtils.saveTemplate(template);
          
          // Only show success alert when creating a new template for the first time
          if (!id && template.id !== id) {
            setAlert({
              type: 'success',
              message: 'Template saved successfully',
            });
            
            // Update the URL to include the ID for future saves
            navigate(`/editor/${template.id}`, { replace: true });
          }
        } catch (error) {
          setAlert({
            type: 'error',
            message: 'Auto-save failed',
          });
        }
      }, 500); // 500ms debounce
      
      return () => clearTimeout(saveTimeout);
    }
  }, [template, id, navigate]);

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
          {id ? 'Edit Epic' : 'Create Epic'}
        </Typography>
        
        <Stack direction="row" spacing={1}>
          <CyberButton 
            variant="contained"
            startIcon={<CyberIcon icon={ArrowBackIcon} size={20} />}
            onClick={() => navigate('/')}
            glowIntensity={0.7}
            sx={{ 
              backgroundColor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.main, 0.8)
                : theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.secondary.main, 0.8)
                  : theme.palette.primary.dark,
                transform: 'translateY(-2px)',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 0 12px ${alpha(theme.palette.secondary.main, 0.7)}`
                  : `0 4px 8px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              '&.Mui-disabled': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? alpha(theme.palette.action.disabled, 0.4)
                  : alpha(theme.palette.action.disabled, 0.7),
                color: theme.palette.text.disabled
              }
            }}
          >
            Back
          </CyberButton>
        </Stack>
      </Box>

      {/* Epic Details Component */}
      <EpicDetailsEditor 
        epicDetails={template.epicDetails}
        onChange={handleEpicChange}
        onStateChange={handleEpicStateChange}
      />

      {/* Story Templates List Component */}
      <StoryTemplatesList
        stories={template.storyTemplates}
        onAddStory={handleAddStory}
        onUpdateStory={handleUpdateStory}
        onDeleteStory={handleDeleteStory}
      />

      {/* Variables Manager Component */}
      <VariablesManager
        variables={template.variables}
        onAddVariable={handleAddVariable}
        onRemoveVariable={handleRemoveVariable}
      />
    </Box>
  );
};

export default TemplateEditor;
