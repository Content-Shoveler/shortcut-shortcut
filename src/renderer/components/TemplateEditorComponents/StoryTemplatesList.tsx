import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { 
  CyberCard, 
  CyberButton, 
  CyberIcon 
} from '../cyberpunk';
import { StoryTemplate } from '../../types';
import StoryEditor from './StoryEditor';

interface StoryTemplatesListProps {
  stories: StoryTemplate[];
  onAddStory: (story: StoryTemplate) => void;
  onUpdateStory: (index: number, story: StoryTemplate) => void;
  onDeleteStory: (index: number) => void;
}

const StoryTemplatesList: React.FC<StoryTemplatesListProps> = ({
  stories,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
}) => {
  const theme = useTheme();
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryTemplate | null>(null);
  const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null);

  const openNewStoryDialog = () => {
    setCurrentStory({
      name: '',
      description: '',
      type: 'feature',
      state: 'Ready for Development',
      workflow_id: '',
      workflow_state_id: '',
      estimate: 0,
      labels: [],
    });
    setEditingStoryIndex(null);
    setStoryDialogOpen(true);
  };

  const openEditStoryDialog = (index: number) => {
    const story = { ...stories[index] };
    setCurrentStory(story);
    setEditingStoryIndex(index);
    setStoryDialogOpen(true);
  };

  const handleSaveStory = (story: StoryTemplate) => {
    if (editingStoryIndex !== null) {
      onUpdateStory(editingStoryIndex, story);
    } else {
      onAddStory(story);
    }
    setStoryDialogOpen(false);
    setCurrentStory(null);
    setEditingStoryIndex(null);
  };

  return (
    <CyberCard sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Story Templates ({stories.length})
        </Typography>
        <CyberButton 
          variant="outlined" 
          startIcon={<CyberIcon icon={AddIcon} size={20} />}
          onClick={openNewStoryDialog}
          scanlineEffect
        >
          Add Story
        </CyberButton>
      </Box>

      {stories.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No stories added yet. Click "Add Story" to create your first story template.
        </Typography>
      ) : (
        <List>
          {stories.map((story, index) => (
            <React.Fragment key={index}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <IconButton edge="end" onClick={() => onDeleteStory(index)}>
                    <CyberIcon icon={DeleteIcon} size={20} />
                  </IconButton>
                }
                sx={{ 
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease',
                  borderRadius: '2px',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  }
                }}
                onClick={() => openEditStoryDialog(index)}
              >
                <ListItemText
                  primary={story.name || '(Unnamed Story)'}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {story.type} • {story.state} {story.estimate ? `• ${story.estimate} points` : ''}
                      </Typography>
                      {story.description && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ display: 'block', mt: 0.5 }}
                        >
                          {story.description.length > 100
                            ? `${story.description.substring(0, 100)}...`
                            : story.description}
                        </Typography>
                      )}
                      {story.labels && story.labels.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          {story.labels.map(label => (
                            <Chip
                              key={label}
                              label={label}
                              size="small"
                              sx={{ 
                                mr: 0.5, 
                                mb: 0.5,
                                borderRadius: '4px',
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    </React.Fragment>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <StoryEditor
        open={storyDialogOpen}
        onClose={() => setStoryDialogOpen(false)}
        currentStory={currentStory}
        onSave={handleSaveStory}
      />
    </CyberCard>
  );
};

export default StoryTemplatesList;
