import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Divider,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  DndContext, 
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext, 
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CyberTextField,
  CyberButton,
  CyberCard,
  CyberSwitch,
  CyberMultiSelect,
  CyberIcon,
  MultiSelectOption,
} from '../cyberpunk';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { TaskTemplate } from '../../types';
import { useShortcutApi } from '../../hooks/useShortcutApi';

// Props for the TaskManager component
interface TaskManagerProps {
  tasks: TaskTemplate[];
  onChange: (tasks: TaskTemplate[]) => void;
  disabled?: boolean;
}

// Animation variants for drag operations
const dragItemVariants = {
  idle: {
    boxShadow: '0px 0px 0px rgba(0, 255, 255, 0)',
  },
  hover: {
    boxShadow: '0px 0px 10px rgba(0, 255, 255, 0.3)',
  },
  dragging: {
    boxShadow: [
      '0px 0px 15px rgba(0, 255, 255, 0.5)',
      '0px 0px 20px rgba(0, 255, 255, 0.5)',
      '0px 0px 15px rgba(0, 255, 255, 0.5)'
    ],
    scale: 1.03,
    zIndex: 10,
    transition: {
      boxShadow: {
        repeat: Infinity,
        duration: 2,
      },
      default: {
        type: 'spring',
        damping: 15,
        stiffness: 300,
      }
    }
  }
};

// Animation for the drag handle
const dragHandleVariants = {
  initial: {
    opacity: 0.7,
    scale: 1,
  },
  hover: {
    opacity: 1,
    scale: 1.1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    }
  },
  active: {
    opacity: 1,
    scale: 1.2,
    filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.7))',
    transition: {
      scale: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    }
  }
};

// Props for the individual TaskItem component
interface TaskItemProps {
  task: TaskTemplate;
  onEdit: (task: TaskTemplate) => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  members: MultiSelectOption[];
  disabled?: boolean;
  id?: string;
}

// Props for the sortable wrapper component
interface SortableTaskItemProps extends TaskItemProps {
  id: string;
}

// Props for the TaskForm component (add/edit)
interface TaskFormProps {
  task: TaskTemplate | null;
  onSave: (task: TaskTemplate) => void;
  onCancel: () => void;
  members: MultiSelectOption[];
  isEdit?: boolean;
}

/**
 * Sortable wrapper component for TaskItem
 */
export const SortableTaskItem: React.FC<SortableTaskItemProps> = (props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const theme = useTheme();
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 1,
    position: 'relative' as const,
    marginBottom: theme.spacing(1),
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      variants={dragItemVariants}
      initial="idle"
      animate={isDragging ? "dragging" : "idle"}
      whileHover={!isDragging ? "hover" : undefined}
    >
      <TaskItem 
        {...props} 
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </motion.div>
  );
};

/**
 * Component for displaying and managing individual task
 */
export const TaskItem: React.FC<TaskItemProps & { 
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
  isDragging?: boolean;
}> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  members,
  disabled = false,
  dragHandleProps,
  isDragging = false,
}) => {
  const theme = useTheme();

  // Find owner names to display
  const ownerNames = useMemo(() => {
    if (!task.owner_ids || task.owner_ids.length === 0) return null;

    const owners = task.owner_ids
      .map(id => members.find(member => member.id.toString() === id))
      .filter(Boolean)
      .map(member => member?.name || '');

    return owners.length > 0 ? owners.join(', ') : null;
  }, [task.owner_ids, members]);

  // Get owner initials for the badge
  const ownerInitials = useMemo(() => {
    if (!ownerNames) return '--';
    
    // If multiple owners, use the first one's initials
    const firstOwner = ownerNames.split(',')[0].trim();
    const nameParts = firstOwner.split(' ');
    
    if (nameParts.length === 1) return firstOwner.substring(0, 2).toUpperCase();
    
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }, [ownerNames]);

  return (
    <Box
      sx={{
        border: `1px solid ${alpha(
          task.complete ? theme.palette.success.main : theme.palette.primary.main,
          isDragging ? 0.6 : 0.3
        )}`,
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
        '&:hover': {
          boxShadow: `0 0 8px ${alpha(
            task.complete ? theme.palette.success.main : theme.palette.primary.main,
            0.2
          )}`,
        },
        ...(isDragging && {
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(4px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: '8px',
            height: '8px',
            borderTop: `2px solid ${task.complete ? theme.palette.success.main : theme.palette.primary.main}`,
            borderRight: `2px solid ${task.complete ? theme.palette.success.main : theme.palette.primary.main}`,
            zIndex: 1,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '8px',
            height: '8px',
            borderBottom: `2px solid ${task.complete ? theme.palette.success.main : theme.palette.primary.main}`,
            borderLeft: `2px solid ${task.complete ? theme.palette.success.main : theme.palette.primary.main}`,
            zIndex: 1,
          },
        })
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(1, 2),
          backgroundColor: alpha(
            task.complete ? theme.palette.success.main : theme.palette.primary.main,
            isDragging ? 0.1 : 0.05
          ),
        }}
      >
        {/* Drag handle */}
        {dragHandleProps && (
          <Box 
            {...dragHandleProps}
            sx={{ 
              mr: 1,
              cursor: disabled ? 'default' : 'grab',
              '&:active': {
                cursor: 'grabbing'
              }
            }}
          >
            <motion.div
              variants={dragHandleVariants}
              initial="initial"
              whileHover="hover"
              whileTap="active"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: alpha(
                  task.complete ? theme.palette.success.main : theme.palette.primary.main,
                  0.7
                ),
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </motion.div>
          </Box>
        )}
        {/* Task completion toggle */}
        <CyberSwitch
          checked={task.complete}
          onChange={onToggleComplete}
          disabled={disabled}
          size="small"
          accentColor={task.complete ? theme.palette.success.main : undefined}
          sx={{ mr: 1 }}
        />

        {/* Task description */}
        <Typography
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textDecoration: task.complete ? 'line-through' : 'none',
            opacity: task.complete ? 0.7 : 1,
          }}
        >
          {task.description}
        </Typography>

        {/* Owner badge */}
        {ownerNames && (
          <Tooltip title={ownerNames}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 28,
                height: 28,
                borderRadius: '4px',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                marginLeft: theme.spacing(1),
                fontFamily: "'Rajdhani', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 'bold',
              }}
            >
              {ownerInitials}
            </Box>
          </Tooltip>
        )}

        {/* Action buttons */}
        <Box sx={{ display: 'flex', ml: 1 }}>
          <IconButton size="small" onClick={() => onEdit(task)} disabled={disabled}>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={onDelete} disabled={disabled}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Form component for adding or editing tasks
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSave,
  onCancel,
  members,
  isEdit = false,
}) => {
  const theme = useTheme();
  const [description, setDescription] = useState(task?.description || '');
  const [complete, setComplete] = useState(task?.complete || false);
  const [ownerIds, setOwnerIds] = useState<string[]>(task?.owner_ids || []);

  // Convert owner IDs to MultiSelectOption format
  const selectedOwners = useMemo(() => {
    if (!ownerIds || ownerIds.length === 0) return [];

    return ownerIds
      .map(id => members.find(member => member.id.toString() === id))
      .filter(Boolean) as MultiSelectOption[];
  }, [ownerIds, members]);

  // Handle owner selection change
  const handleOwnerChange = (selected: MultiSelectOption[]) => {
    setOwnerIds(selected.map(owner => owner.id.toString()));
  };

  // Handle form submission
  const handleSave = () => {
    if (!description.trim()) return;

    onSave({
      description: description.trim(),
      complete,
      owner_ids: ownerIds.length > 0 ? ownerIds : undefined,
    });

    // Reset form
    setDescription('');
    setComplete(false);
    setOwnerIds([]);
  };

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <CyberCard
        sx={{
          p: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Stack spacing={2}>
          <CyberTextField
            label="Task Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            cornerClip
            autoFocus
          />

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Status:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CyberSwitch
                checked={complete}
                onChange={() => setComplete(!complete)}
                size="small"
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {complete ? 'Complete' : 'Not Complete'}
              </Typography>
            </Box>
          </Box>

          {/* Owner selector */}
          {members.length > 0 && (
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Owner:
              </Typography>
              <CyberMultiSelect
                options={members}
                value={selectedOwners}
                onChange={handleOwnerChange}
                placeholder="Select task owner"
                cornerClip
              />
            </Box>
          )}

          {/* Form buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <CyberButton onClick={onCancel} sx={{ mr: 1 }}>
              Cancel
            </CyberButton>
            <CyberButton
              variant="contained"
              onClick={handleSave}
              disabled={!description.trim()}
            >
              {isEdit ? 'Update Task' : 'Add Task'}
            </CyberButton>
          </Box>
        </Stack>
      </CyberCard>
    </Box>
  );
};

/**
 * Dialog component for editing a task
 */
export const TaskEditDialog: React.FC<{
  open: boolean;
  task: TaskTemplate | null;
  onClose: () => void;
  onSave: (task: TaskTemplate) => void;
  members: MultiSelectOption[];
}> = ({ open, task, onClose, onSave, members }) => {
  const theme = useTheme();

  if (!task) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundImage: `linear-gradient(135deg, ${alpha(
            theme.palette.background.paper,
            0.9
          )} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: theme.palette.mode === 'dark'
            ? `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}`
            : '0 4px 20px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '60%',
            background: theme.palette.secondary.main,
            opacity: 0.8,
          },
        }}
      >
        Edit Task
      </DialogTitle>
      <DialogContent>
        <TaskForm
          task={task}
          onSave={onSave}
          onCancel={onClose}
          members={members}
          isEdit={true}
        />
      </DialogContent>
    </Dialog>
  );
};

/**
 * Main component for managing tasks in a story
 */
export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks = [],
  onChange,
  disabled = false,
}) => {
  const shortcutApi = useShortcutApi();
  const [members, setMembers] = useState<MultiSelectOption[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  // Load members from API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        if (shortcutApi.hasApiToken) {
          const memberData = await shortcutApi.fetchMembers();
          // Convert to MultiSelectOption format
          const options = memberData.map((member: any) => ({
            id: member.id,
            name: member.profile ? member.profile.name : `Member ${member.id}`,
          }));
          setMembers(options);
        }
      } catch (error) {
        console.error('Error fetching members for task management:', error);
      } finally {
        setLoadingMembers(false);
      }
    };
    
    fetchMembers();
  }, [shortcutApi.hasApiToken]);
  const theme = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // State for drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  
  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // Find active task for drag overlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return tasks.find((_, i) => `task-${i}` === activeId);
  }, [activeId, tasks]);
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };
  
  // Handle drag end - reorder tasks
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      
      const newTasks = arrayMove(tasks, oldIndex, newIndex);
      onChange(newTasks);
    }
    
    setActiveId(null);
  };

  // Handle adding a new task
  const handleAddTask = (task: TaskTemplate) => {
    onChange([...tasks, task]);
    setShowAddForm(false);
  };

  // Handle editing a task
  const handleUpdateTask = (updatedTask: TaskTemplate, index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    onChange(newTasks);
    setEditDialogOpen(false);
    setEditingTask(null);
  };

  // Handle deleting a task
  const handleDeleteTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    onChange(newTasks);
  };

  // Handle toggling task completion
  const handleToggleComplete = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index] = {
      ...newTasks[index],
      complete: !newTasks[index].complete,
    };
    onChange(newTasks);
  };

  // Open edit dialog for a task
  const handleEditTask = (task: TaskTemplate, index: number) => {
    setEditingTask({ ...task, _index: index } as TaskTemplate & { _index: number });
    setEditDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ mb: 2 }} />
      
      {loadingMembers && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <Typography color="text.secondary">Loading members...</Typography>
        </Box>
      )}
      
      {/* Section header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            position: 'relative',
            pl: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: '4px',
              height: '70%',
              background: theme.palette.secondary.main,
            },
          }}
        >
          Tasks
        </Typography>
        
        {!showAddForm && (
          <CyberButton
            startIcon={<AddIcon />}
            onClick={() => setShowAddForm(true)}
            size="small"
            disabled={disabled || loadingMembers}
            sx={{ ml: 'auto' }}
          >
            Add Task
          </CyberButton>
        )}
      </Box>

      {/* Task list with drag and drop */}
      <Box
        sx={{
          backgroundColor: alpha(theme.palette.background.paper, 0.3),
          borderRadius: '4px',
          padding: tasks.length > 0 ? theme.spacing(2) : 0,
          maxHeight: '300px',
          overflowY: 'auto',
        }}
      >
        {tasks.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map((_, i) => `task-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <SortableTaskItem
                    key={`task-${index}`}
                    id={`task-${index}`}
                    task={task}
                    onEdit={(task) => handleEditTask(task, index)}
                    onDelete={() => handleDeleteTask(index)}
                    onToggleComplete={() => handleToggleComplete(index)}
                    members={members}
                    disabled={disabled}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
            
            {/* Drag overlay - shows the item being dragged */}
            <DragOverlay adjustScale={true} zIndex={1000}>
              {activeId && activeTask ? (
                <Box
                  sx={{
                    opacity: 0.8,
                    width: '100%',
                    pointerEvents: 'none',
                    transformOrigin: '0 0',
                  }}
                >
                  <TaskItem
                    task={activeTask}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    onToggleComplete={() => {}}
                    members={members}
                    disabled={true}
                    isDragging={true}
                  />
                </Box>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          !showAddForm && (
            <Box
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
                borderRadius: '4px',
                border: `1px dashed ${alpha(theme.palette.text.secondary, 0.3)}`,
              }}
            >
              <Typography color="textSecondary">
                No tasks added yet
              </Typography>
            </Box>
          )
        )}
      </Box>

      {/* Add task form */}
      {showAddForm && (
        <TaskForm
          task={null}
          onSave={handleAddTask}
          onCancel={() => setShowAddForm(false)}
          members={members}
        />
      )}

      {/* Edit task dialog */}
      {editingTask && !loadingMembers && (
        <TaskEditDialog
          open={editDialogOpen}
          task={editingTask}
          onClose={() => {
            setEditDialogOpen(false);
            setEditingTask(null);
          }}
          onSave={(updatedTask) => 
            handleUpdateTask(updatedTask, (editingTask as any)._index)
          }
          members={members}
        />
      )}
    </Box>
  );
};
