import React, { useState, useMemo } from 'react';
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
  CyberTextField,
  CyberButton,
  CyberCard,
  CyberSwitch,
  CyberMultiSelect,
  MultiSelectOption,
} from '../cyberpunk';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { TaskTemplate } from '../../types';

// Props for the TaskManager component
interface TaskManagerProps {
  tasks: TaskTemplate[];
  onChange: (tasks: TaskTemplate[]) => void;
  members?: MultiSelectOption[];
  disabled?: boolean;
}

// Props for the individual TaskItem component
interface TaskItemProps {
  task: TaskTemplate;
  onEdit: (task: TaskTemplate) => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  members?: MultiSelectOption[];
  disabled?: boolean;
}

// Props for the TaskForm component (add/edit)
interface TaskFormProps {
  task: TaskTemplate | null;
  onSave: (task: TaskTemplate) => void;
  onCancel: () => void;
  members?: MultiSelectOption[];
  isEdit?: boolean;
}

/**
 * Component for displaying and managing individual task
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  members = [],
  disabled = false,
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
        mb: 1,
        border: `1px solid ${alpha(
          task.complete ? theme.palette.success.main : theme.palette.primary.main,
          0.3
        )}`,
        borderRadius: '4px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: `0 0 8px ${alpha(
            task.complete ? theme.palette.success.main : theme.palette.primary.main,
            0.2
          )}`,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: theme.spacing(1, 2),
          backgroundColor: alpha(
            task.complete ? theme.palette.success.main : theme.palette.primary.main,
            0.05
          ),
        }}
      >
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
  members = [],
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
  members?: MultiSelectOption[];
}> = ({ open, task, onClose, onSave, members = [] }) => {
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
  members = [],
  disabled = false,
}) => {
  const theme = useTheme();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskTemplate | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
            disabled={disabled}
            sx={{ ml: 'auto' }}
          >
            Add Task
          </CyberButton>
        )}
      </Box>

      {/* Task list */}
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
          tasks.map((task, index) => (
            <TaskItem
              key={index}
              task={task}
              onEdit={(task) => handleEditTask(task, index)}
              onDelete={() => handleDeleteTask(index)}
              onToggleComplete={() => handleToggleComplete(index)}
              members={members}
              disabled={disabled}
            />
          ))
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
      {editingTask && (
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
