import React, { useState } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
  alpha,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { 
  CyberCard, 
  CyberButton, 
  CyberTextField, 
  CyberIcon 
} from '../cyberpunk';

interface VariablesManagerProps {
  variables: string[];
  onAddVariable: (variable: string) => void;
  onRemoveVariable: (variable: string) => void;
}

const VariablesManager: React.FC<VariablesManagerProps> = ({
  variables,
  onAddVariable,
  onRemoveVariable,
}) => {
  const theme = useTheme();
  const [variableDialogOpen, setVariableDialogOpen] = useState(false);
  const [newVariable, setNewVariable] = useState('');

  const handleAddVariable = () => {
    if (newVariable.trim() !== '' && !variables.includes(newVariable.trim())) {
      onAddVariable(newVariable.trim());
      setNewVariable('');
      setVariableDialogOpen(false);
    }
  };

  return (
    <CyberCard sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Variables ({variables.length})
        </Typography>
        <CyberButton 
          variant="outlined" 
          startIcon={<CyberIcon icon={AddIcon} size={20} />}
          onClick={() => setVariableDialogOpen(true)}
          scanlineEffect
        >
          Add Variable
        </CyberButton>
      </Box>

      {variables.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          No variables detected. Add variables using the {"{{Variable}}"} syntax in your templates.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {variables.map((variable) => (
            <Chip
              key={variable}
              label={variable}
              onDelete={() => onRemoveVariable(variable)}
              color="primary"
              variant="outlined"
              sx={{ 
                borderRadius: '4px',
                fontFamily: "'Share Tech Mono', monospace",
              }}
            />
          ))}
        </Box>
      )}

      {/* Variable Dialog */}
      <Dialog 
        open={variableDialogOpen} 
        onClose={() => setVariableDialogOpen(false)}
        PaperProps={{
          sx: {
            backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.85)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            boxShadow: theme.palette.mode === 'dark' ? `0 0 15px ${alpha(theme.palette.secondary.main, 0.3)}` : '0 4px 20px rgba(0, 0, 0, 0.15)',
          }
        }}
      >
        <DialogTitle sx={{ 
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
          }
        }}>
          Add Variable
        </DialogTitle>
        <DialogContent>
          <CyberTextField
            fullWidth
            margin="normal"
            label="Variable Name"
            value={newVariable}
            onChange={(e) => setNewVariable(e.target.value)}
            helperText="This variable will be available for replacement when applying the template"
            cornerClip
          />
        </DialogContent>
        <DialogActions>
          <CyberButton onClick={() => setVariableDialogOpen(false)}>
            Cancel
          </CyberButton>
          <CyberButton 
            onClick={handleAddVariable}
            variant="contained"
            disabled={!newVariable.trim() || variables.includes(newVariable.trim())}
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
            Add
          </CyberButton>
        </DialogActions>
      </Dialog>
    </CyberCard>
  );
};

export default VariablesManager;
