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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
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
  CyberIcon,
  CyberDialog
} from '../cyberpunk';
import { StoryTemplate, TaskTemplate } from '../../types';
import { memberField, iterationField, groupField } from '../ShortcutFields/fieldDefinitions';
import { useField } from '../ShortcutFields/hooks';
import { useShortcutApi } from '../../hooks/useShortcutApi';
import { useSettings } from '../../store/AppProviders';
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
  onDuplicate: () => void;
  getMemberName: (id: string) => string;
  getIterationName: (id: string) => string;
  getTeamName: (id: string) => string;
  getTeamInfo: (id: string) => { name: string; color: string };
}

const StoryPreview: React.FC<StoryPreviewProps> = ({ 
  story, 
  onEdit, 
  onDelete,
  onDuplicate,
  getMemberName,
  getIterationName,
  getTeamName,
  getTeamInfo
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
                onDuplicate();
              }}
              sx={{
                mr: 0.5,
                '&:hover': { 
                  backgroundColor: alpha(theme.palette.info.main, 0.1) 
                } 
              }}
            >
              <CyberIcon icon={ContentCopyIcon} size={20} color={theme.palette.info.main} />
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
            
            {/* Team badge with team-specific color */}
            {story.group_id && (
              (() => {
                const teamInfo = getTeamInfo(story.group_id);
                const teamColor = teamInfo.color;
                return (
                  <Chip 
                    icon={<CyberIcon icon={GroupIcon} size={16} />}
                    label={teamInfo.name}
                    size="small"
                    sx={{ 
                      backgroundColor: alpha(teamColor, 0.1),
                      border: `1px solid ${alpha(teamColor, 0.3)}`,
                      borderRadius: '4px',
                      fontFamily: "'Rajdhani', sans-serif",
                      fontWeight: 500,
                      '& .MuiChip-icon': {
                        color: teamColor
                      }
                    }}
                  />
                );
              })()
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

// Story Card View for grid layout
const CardView: React.FC<{
  stories: StoryTemplate[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  getMemberName: (id: string) => string;
  getIterationName: (id: string) => string;
  getTeamName: (id: string) => string;
  getTeamInfo: (id: string) => { name: string; color: string };
}> = ({ stories, onEdit, onDelete, onDuplicate, getMemberName, getIterationName, getTeamName, getTeamInfo }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: -1 }}>
      {stories.map((story, index) => (
        <Box key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%' }, padding: 1 }}>
          <StoryPreview 
            story={story} 
            onEdit={() => onEdit(index)} 
            onDelete={() => onDelete(index)}
            onDuplicate={() => onDuplicate(index)}
            getMemberName={getMemberName}
            getIterationName={getIterationName}
            getTeamName={getTeamName}
            getTeamInfo={getTeamInfo}
          />
        </Box>
      ))}
    </Box>
  );
};

// Story List View for compact table-like layout
const ListView: React.FC<{
  stories: StoryTemplate[];
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onDuplicate: (index: number) => void;
  getMemberName: (id: string) => string;
  getIterationName: (id: string) => string;
  getTeamName: (id: string) => string;
  getTeamInfo: (id: string) => { name: string; color: string };
}> = ({ stories, onEdit, onDelete, onDuplicate, getMemberName, getIterationName, getTeamName, getTeamInfo }) => {
  const theme = useTheme();
  
  return (
    <TableContainer 
      component={Paper}
      sx={{ 
        background: 'transparent',
        boxShadow: 'none',
        mb: 2,
        '& .MuiTableCell-root': {
          borderColor: alpha(theme.palette.divider, 0.1),
          padding: theme.spacing(1.5),
          fontFamily: "'Rajdhani', sans-serif",
        },
        '& .MuiTableHead-root': {
          '& .MuiTableCell-root': {
            backgroundColor: alpha(theme.palette.background.paper, 0.3),
            backdropFilter: 'blur(5px)',
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: theme.palette.text.secondary,
          },
        },
        '& .MuiTableBody-root': {
          '& .MuiTableRow-root': {
            transition: 'all 0.2s ease',
            position: 'relative',
            // Cyber style outline that only appears on hover
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: `1px solid transparent`,
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              transition: 'all 0.2s ease',
              pointerEvents: 'none',
              opacity: 0,
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              backdropFilter: 'blur(5px)',
              cursor: 'pointer',
              '&::before': {
                borderColor: alpha(theme.palette.primary.main, 0.3),
                opacity: 1,
              },
            },
          },
        },
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Details</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stories.map((story, index) => {
            // Get type info
            let typeIcon;
            let typeColor;
            switch(story.type) {
              case 'bug':
                typeIcon = BugReportIcon;
                typeColor = theme.palette.error.main;
                break;
              case 'chore':
                typeIcon = BuildIcon;
                typeColor = theme.palette.info.main;
                break;
              case 'feature':
              default:
                typeIcon = ExtensionIcon;
                typeColor = theme.palette.success.main;
            }
            
            // Calculate task completion
            const taskProgress = story.tasks?.length 
              ? {
                  total: story.tasks.length,
                  completed: story.tasks.filter(task => task.complete).length,
                }
              : null;
              
            // Process owner IDs
            const ownerIds = story.owner_ids && Array.isArray(story.owner_ids) ? story.owner_ids : [];
            
            return (
              <TableRow 
                key={index}
                onClick={() => onEdit(index)}
                sx={{
                  // Row with data flow animation on hover
                  overflow: 'hidden',
                  '&:hover .data-flow': {
                    opacity: 0.1,
                    transform: 'translateX(100%)',
                  }
                }}
              >
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.5,
                      borderRadius: '4px',
                      backgroundColor: alpha(typeColor, 0.1),
                      border: `1px solid ${alpha(typeColor, 0.3)}`,
                      width: 'fit-content',
                    }}
                  >
                    <CyberIcon 
                      icon={typeIcon} 
                      size={20} 
                      color={typeColor} 
                      glowIntensity={0.5} 
                    />
                  </Box>
                  {/* Data flow animation element */}
                  <Box
                    className="data-flow"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: `linear-gradient(90deg, transparent 0%, ${alpha(typeColor, 0.2)} 50%, transparent 100%)`,
                      opacity: 0,
                      transform: 'translateX(0%)',
                      transition: 'all 0.8s ease',
                      pointerEvents: 'none',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Typography 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '200px',
                      textShadow: `0 0 5px ${alpha(typeColor, 0.3)}`,
                    }}
                  >
                    {story.name || '(Unnamed Story)'}
                  </Typography>
                  {story.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        fontSize: '0.75rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                        opacity: 0.7,
                        fontFamily: "'Share Tech Mono', monospace",
                      }}
                    >
                      {story.description.substring(0, 40)}{story.description.length > 40 ? '...' : ''}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {story.state && (
                    <Chip 
                      label={story.state}
                      size="small"
                      sx={{ 
                        height: '20px',
                        fontSize: '0.7rem',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        borderRadius: '4px',
                      }}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {story.estimate !== undefined && story.estimate > 0 && (
                      <Chip 
                        icon={<CyberIcon icon={TimerIcon} size={14} />}
                        label={`${story.estimate}pt`}
                        size="small"
                        sx={{ 
                          height: '20px',
                          fontSize: '0.7rem',
                          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    
                    {taskProgress && (
                      <Chip 
                        icon={<CyberIcon icon={AssignmentTurnedInIcon} size={14} />}
                        label={`${taskProgress.completed}/${taskProgress.total}`}
                        size="small"
                        sx={{ 
                          height: '20px',
                          fontSize: '0.7rem',
                          backgroundColor: alpha(
                            taskProgress.completed === taskProgress.total 
                              ? theme.palette.success.main 
                              : theme.palette.warning.main, 
                            0.1
                          ),
                          border: `1px solid ${alpha(
                            taskProgress.completed === taskProgress.total 
                              ? theme.palette.success.main 
                              : theme.palette.warning.main, 
                            0.3
                          )}`,
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    
                    {story.iteration_id && (
                      <Chip 
                        icon={<CyberIcon icon={LocalOfferIcon} size={14} />}
                        label={getIterationName(story.iteration_id)}
                        size="small"
                        sx={{ 
                          height: '20px',
                          fontSize: '0.7rem',
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                          borderRadius: '4px',
                        }}
                      />
                    )}
                    
                    {/* Team badge in list view with team-specific color */}
                    {story.group_id && (
                      (() => {
                        const teamInfo = getTeamInfo(story.group_id);
                        const teamColor = teamInfo.color;
                        return (
                          <Chip 
                            icon={<CyberIcon icon={GroupIcon} size={14} color={teamColor} />}
                            label={teamInfo.name}
                            size="small"
                            sx={{ 
                              height: '20px',
                              fontSize: '0.7rem',
                              backgroundColor: alpha(teamColor, 0.1),
                              border: `1px solid ${alpha(teamColor, 0.3)}`,
                              borderRadius: '4px',
                              color: teamColor
                            }}
                          />
                        );
                      })()
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {ownerIds.length > 0 ? (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {ownerIds.map((ownerId, idx) => (
                        <Chip 
                          key={idx}
                          icon={<CyberIcon icon={PersonIcon} size={14} />}
                          label={getMemberName(ownerId)}
                          size="small"
                          sx={{ 
                            height: '20px',
                            fontSize: '0.7rem',
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            borderRadius: '4px',
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', opacity: 0.5 }}>
                      No owners
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(index);
                      }}
                      sx={{ 
                        mr: 0.5,
                        padding: 0.5,
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                        } 
                      }}
                    >
                      <CyberIcon icon={EditIcon} size={18} color={theme.palette.primary.main} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicate(index);
                      }}
                      sx={{ 
                        mr: 0.5,
                        padding: 0.5,
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.info.main, 0.1) 
                        } 
                      }}
                    >
                      <CyberIcon icon={ContentCopyIcon} size={18} color={theme.palette.info.main} />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(index);
                      }}
                      sx={{ 
                        padding: 0.5,
                        '&:hover': { 
                          backgroundColor: alpha(theme.palette.error.main, 0.1) 
                        } 
                      }}
                    >
                      <CyberIcon icon={DeleteIcon} size={18} color={theme.palette.error.main} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const StoryTemplatesList: React.FC<StoryTemplatesListProps> = ({
  stories,
  onAddStory,
  onUpdateStory,
  onDeleteStory,
}) => {
  const theme = useTheme();
  const shortcutApi = useShortcutApi();
  const { settings } = useSettings(); // Get user settings
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] = useState<StoryTemplate | null>(null);
  const [editingStoryIndex, setEditingStoryIndex] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStoryIndex, setDeletingStoryIndex] = useState<number | null>(null);
  
  // Use field hooks for members, iterations, and teams
  const memberFieldHandler = useField(memberField);
  const iterationFieldHandler = useField(iterationField);
  const groupFieldHandler = useField(groupField);
  
  // Load members, iterations, and teams when component mounts
  useEffect(() => {
    if (shortcutApi.hasApiToken) {
      memberFieldHandler.refresh();
      iterationFieldHandler.refresh();
      groupFieldHandler.refresh();
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
  
  // Helper functions to get team information (name and color)
  const getTeamInfo = (groupId: string) => {
    const team = groupFieldHandler.options.find(g => g.id.toString() === groupId);
    return {
      name: team?.name || groupId, // Return name or ID as fallback
      color: team?.color || '#6c757d' // Return color or default gray
    };
  };
  
  // For backward compatibility
  const getTeamName = (groupId: string) => {
    return getTeamInfo(groupId).name;
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
  
  // Open delete confirmation dialog
  const openDeleteConfirmDialog = (index: number) => {
    setDeletingStoryIndex(index);
    setDeleteDialogOpen(true);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deletingStoryIndex !== null) {
      onDeleteStory(deletingStoryIndex);
      setDeleteDialogOpen(false);
      setDeletingStoryIndex(null);
    }
  };
  
  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeletingStoryIndex(null);
  };
  
  // Handle story duplication
  const handleDuplicateStory = (index: number) => {
    // Create a deep copy of the story
    const storyToDuplicate = JSON.parse(JSON.stringify(stories[index]));
    
    // Add "Copy" to the name to distinguish it
    storyToDuplicate.name = `${storyToDuplicate.name} (Copy)`;
    
    // Add the duplicate to the list
    onAddStory(storyToDuplicate);
  };

  // Determine which view to show based on user settings
  const viewMode = settings.appearance.viewMode;

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
            viewMode === 'card' ? (
          <CardView 
            stories={stories}
            onEdit={openEditStoryDialog}
            onDelete={openDeleteConfirmDialog}
            onDuplicate={handleDuplicateStory}
            getMemberName={getMemberName}
            getIterationName={getIterationName}
            getTeamName={getTeamName}
            getTeamInfo={getTeamInfo}
          />
        ) : (
          <ListView 
            stories={stories}
            onEdit={openEditStoryDialog}
            onDelete={openDeleteConfirmDialog}
            onDuplicate={handleDuplicateStory}
            getMemberName={getMemberName}
            getIterationName={getIterationName}
            getTeamName={getTeamName}
            getTeamInfo={getTeamInfo}
          />
        )
      )}

      <StoryEditor
        open={storyDialogOpen}
        onClose={() => setStoryDialogOpen(false)}
        currentStory={currentStory}
        onSave={handleSaveStory}
      />

      {/* Delete confirmation dialog */}
      <CyberDialog 
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        title="Delete Story"
        contentSx={{ 
          p: 3, 
          maxWidth: 500,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
        actions={
          <>
            <CyberButton 
              variant="outlined" 
              onClick={handleDeleteCancel}
              color="secondary"
            >
              Cancel
            </CyberButton>
            <CyberButton 
              variant="contained" 
              onClick={handleDeleteConfirm}
              color="error"
              startIcon={<CyberIcon icon={DeleteIcon} size={18} />}
              scanlineEffect
            >
              Delete Story
            </CyberButton>
          </>
        }
      >
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete this story template?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This action cannot be undone. The story will be permanently removed from this template.
        </Typography>
      </CyberDialog>
    </CyberCard>
  );
};

export default StoryTemplatesList;
