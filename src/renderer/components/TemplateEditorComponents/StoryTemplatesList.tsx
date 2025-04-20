import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Divider,
  IconButton,
  List,
  Chip,
  Tooltip,
  Badge,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import BugReportIcon from '@mui/icons-material/BugReport';
import ExtensionIcon from '@mui/icons-material/Extension';
import BuildIcon from '@mui/icons-material/Build';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupIcon from '@mui/icons-material/Group';
import TimerIcon from '@mui/icons-material/Timer';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import PersonIcon from '@mui/icons-material/Person';
import { motion } from 'framer-motion';
import { 
  CyberCard, 
  CyberButton, 
  CyberIcon 
} from '../cyberpunk';
import { StoryTemplate, TaskTemplate } from '../../types';
import { memberField, iterationField } from '../ShortcutFields/fieldDefinitions';
import { useField } from '../ShortcutFields/hooks';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import StoryEditor from './StoryEditor';

// Animation variants for the story preview card
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

// Helper component for animated story preview
interface StoryPreviewProps {
  story: StoryTemplate;
  onEdit: () => void;
  onDelete: () => void;
  getMemberName: (id: string) => string;
  getIterationName: (id: string) => string;
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ 
  story, 
  onEdit, 
  onDelete,
  getMemberName,
  getIterationName 
}) => {
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
  
  // Calculate task completion percentage if tasks exist
  const taskProgress = useMemo(() => {
    if (!story.tasks || story.tasks.length === 0) return null;
    
    const totalTasks = story.tasks.length;
    const completedTasks = story.tasks.filter(task => task.complete).length;
    const percentage = Math.round((completedTasks / totalTasks) * 100);
    
    return {
      total: totalTasks,
      completed: completedTasks,
      percentage
    };
  }, [story.tasks]);
  
  // Process owner IDs for badges
  const ownerIds = useMemo(() => {
    if (!story.owner_ids || !Array.isArray(story.owner_ids) || story.owner_ids.length === 0) {
      return [];
    }
    
    // Use the actual owner_ids from the template storage
    return story.owner_ids;
  }, [story.owner_ids]);

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
          cursor: 'pointer',
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
        onClick={onEdit}
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
          <Tooltip title={getTypeInfo.label}>
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
          </Tooltip>

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

          <Box sx={{ display: 'flex', ml: 1 }}>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              sx={{ 
                mr: 0.5,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                } 
              }}
            >
              <CyberIcon icon={EditIcon} size={20} color={theme.palette.primary.main} />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              sx={{ 
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.error.main, 0.1) 
                } 
              }}
            >
              <CyberIcon icon={DeleteIcon} size={20} color={theme.palette.error.main} />
            </IconButton>
          </Box>
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
            
            {taskProgress && (
              <Chip 
                icon={<CyberIcon icon={AssignmentTurnedInIcon} size={16} />}
                label={`${taskProgress.completed}/${taskProgress.total} tasks${taskProgress.percentage < 100 ? ` (${taskProgress.percentage}%)` : ''}`}
                size="small"
                sx={{ 
                  backgroundColor: alpha(taskProgress.percentage === 100 
                    ? theme.palette.success.main 
                    : theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(taskProgress.percentage === 100 
                    ? theme.palette.success.main 
                    : theme.palette.warning.main, 0.3)}`,
                  borderRadius: '4px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: taskProgress.percentage === 100 
                      ? theme.palette.success.main 
                      : theme.palette.warning.main
                  }
                }}
              />
            )}
            
            {story.iteration_id && (
              <Chip 
                icon={<CyberIcon icon={LocalOfferIcon} size={16} />}
                label={getIterationName(story.iteration_id)}
                size="small"
                sx={{ 
                  backgroundColor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                  borderRadius: '4px',
                  fontFamily: "'Rajdhani', sans-serif",
                  fontWeight: 500,
                  '& .MuiChip-icon': {
                    color: theme.palette.info.main
                  }
                }}
              />
            )}
            
            {/* Owner badges - one per owner ID */}
            {ownerIds.map((ownerId, index) => (
              <Chip 
                key={index}
                icon={<CyberIcon icon={PersonIcon} size={16} />}
                label={getMemberName(ownerId)}
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
            ))}
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
  const shortcutApi = useShortcutApi();
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryTemplate | null>(null);
  const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null);
  
  // Use field hooks for members and iterations
  const memberFieldHandler = useField(memberField);
  const iterationFieldHandler = useField(iterationField);
  
  // Load members and iterations when component mounts
  useEffect(() => {
    if (shortcutApi.hasApiToken) {
      memberFieldHandler.refresh();
      iterationFieldHandler.refresh();
    }
  }, [shortcutApi.hasApiToken]);
  
  // Helper functions to get names from IDs
  const getMemberName = (memberId: string) => {
    const member = memberFieldHandler.options.find(m => m.id.toString() === memberId);
    if (member?.profile?.name) {
      return member.profile.name.split(' ')[0]; // First name only
    }
    return memberId; // Fallback to ID
  };
  
  const getIterationName = (iterationId: string) => {
    const iteration = iterationFieldHandler.options.find(i => i.id.toString() === iterationId);
    return iteration?.name || iterationId; // Return name or ID as fallback
  };

  const openNewStoryDialog = () => {
    setCurrentStory({
      name: '',
      description: '',
      type: 'feature',
      state: 'Ready for Development',
      workflow_id: '',
      workflow_state_id: '',
      estimate: 0
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
        <List sx={{ width: '100%' }}>
          <Stack spacing={2}>
            {stories.map((story, index) => (
              <Box key={index}>
                <StoryPreview 
                  story={story} 
                  onEdit={() => openEditStoryDialog(index)} 
                  onDelete={() => onDeleteStory(index)}
                  getMemberName={getMemberName}
                  getIterationName={getIterationName}
                />
              </Box>
            ))}
          </Stack>
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
