import React, { useState, useEffect, useMemo } from 'react';
import {
  Typography,
  FormControl,
  MenuItem,
  Box,
  Alert,
  alpha,
  useTheme,
} from '@mui/material';
import { 
  CyberCard, 
  CyberTextField, 
  CyberSelect,
  CyberMultiSelect,
  MultiSelectOption
} from '../cyberpunk';
import { EpicDetails } from '../../types';
import { 
  MemberSelector, 
  ObjectiveSelector,
  GroupSelector
} from '../ShortcutFields';
// ShortcutEpicState import removed as it's no longer needed
import { useShortcutApi } from '../../hooks/useShortcutApi';

// Helper components for the multi-select fields
interface MemberMultiSelectProps {
  value: any[];
  onChange: (selectedMembers: MultiSelectOption[]) => void;
  shortcutApi: ReturnType<typeof useShortcutApi>;
}

const MemberMultiSelect: React.FC<MemberMultiSelectProps> = ({ value, onChange, shortcutApi }) => {
  const [members, setMembers] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load members from the API
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const memberData = await shortcutApi.fetchMembers();
        // Convert to MultiSelectOption format
        const options = memberData.map((member: any) => ({
          id: member.id,
          name: member.profile ? member.profile.name : `Member ${member.id}`,
          // You can add an avatar or color property if desired
        }));
        setMembers(options);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortcutApi.hasApiToken) {
      fetchMembers();
    }
  }, [shortcutApi]);
  
  // Convert current value to MultiSelectOption format
  const selectedMembers = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) return [];
    
    return value
      .map((id: string) => {
        const member = members.find(mem => mem.id === id);
        return member ? member : null;
      })
      .filter((mem): mem is MultiSelectOption => mem !== null);
  }, [value, members]);
  
  if (loading) {
    return <Typography color="text.secondary">Loading members...</Typography>;
  }
  
  return (
    <CyberMultiSelect
      options={members}
      value={selectedMembers}
      onChange={onChange}
      placeholder="Select owners..."
      helperText="Assign one or more owners to this epic"
      cornerClip
      fullWidth
    />
  );
};


interface ObjectiveMultiSelectProps {
  value: any[];
  onChange: (selectedObjectives: MultiSelectOption[]) => void;
  shortcutApi: ReturnType<typeof useShortcutApi>;
}

const ObjectiveMultiSelect: React.FC<ObjectiveMultiSelectProps> = ({ value, onChange, shortcutApi }) => {
  const [objectives, setObjectives] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load objectives from the API
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        setLoading(true);
        const objectiveData = await shortcutApi.fetchObjectives();
        // Convert to MultiSelectOption format
        const options = objectiveData.map((objective: any) => ({
          id: objective.id,
          name: objective.name
        }));
        setObjectives(options);
      } catch (error) {
        console.error('Error fetching objectives:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortcutApi.hasApiToken) {
      fetchObjectives();
    }
  }, [shortcutApi]);
  
  // Convert current value to MultiSelectOption format by finding the matching objectives
  const selectedObjectives = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) return [];
    
    return value
      .map((id: number | string) => {
        const objective = objectives.find(obj => obj.id === id);
        return objective ? objective : null;
      })
      .filter((obj): obj is MultiSelectOption => obj !== null);
  }, [value, objectives]);
  
  if (loading) {
    return <Typography color="text.secondary">Loading objectives...</Typography>;
  }
  
  return (
    <CyberMultiSelect
      options={objectives}
      value={selectedObjectives}
      onChange={onChange}
      placeholder="Select objectives..."
      helperText="Link this epic to company objectives"
      cornerClip
      fullWidth
    />
  );
};

interface GroupMultiSelectProps {
  value: any[];
  onChange: (selectedGroups: MultiSelectOption[]) => void;
  shortcutApi: ReturnType<typeof useShortcutApi>;
}

const GroupMultiSelect: React.FC<GroupMultiSelectProps> = ({ value, onChange, shortcutApi }) => {
  const [groups, setGroups] = useState<MultiSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Load groups from the API
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const groupData = await shortcutApi.fetchGroups();
        // Convert to MultiSelectOption format
        const options = groupData.map((group: any) => ({
          id: group.id,
          name: group.name
        }));
        setGroups(options);
      } catch (error) {
        console.error('Error fetching groups:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (shortcutApi.hasApiToken) {
      fetchGroups();
    }
  }, [shortcutApi]);
  
  // Convert current value to MultiSelectOption format by finding the matching groups
  const selectedGroups = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) return [];
    
    return value
      .map((id: string) => {
        const group = groups.find(g => g.id === id);
        return group ? group : null;
      })
      .filter((g): g is MultiSelectOption => g !== null);
  }, [value, groups]);
  
  if (loading) {
    return <Typography color="text.secondary">Loading teams...</Typography>;
  }
  
  return (
    <CyberMultiSelect
      options={groups}
      value={selectedGroups}
      onChange={onChange}
      placeholder="Select teams..."
      helperText="Assign teams to this epic"
      cornerClip
      fullWidth
    />
  );
};

interface EpicDetailsEditorProps {
  epicDetails: EpicDetails;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStateChange: (e: { target: { name: string; value: unknown } }) => void;
}

const EpicDetailsEditor: React.FC<EpicDetailsEditorProps> = ({ 
  epicDetails, 
  onChange, 
  onStateChange 
}) => {
  const theme = useTheme();
  const shortcutApi = useShortcutApi();
  const [apiTokenAlert, setApiTokenAlert] = useState<boolean>(false);
  
  // Check if API token is available
  useEffect(() => {
    setApiTokenAlert(!shortcutApi.hasApiToken);
  }, [shortcutApi.hasApiToken]);

  // Set state to "todo" on initialization only once
  useEffect(() => {
    // Set initial state to "todo"
    onStateChange({
      target: {
        name: 'state',
        value: 'todo'
      }
    });
  }, []); // Empty dependency array - run only on mount
  
  // Handle multiple owner selection
  const handleOwnersChange = (selectedMembers: MultiSelectOption[]) => {
    // Extract IDs from the selected members
    const ownerIds = selectedMembers.map(member => member.id);
    
    onStateChange({
      target: {
        name: 'owner_ids',
        value: ownerIds
      }
    });
  };
  
  // Handle date changes (kept for backwards compatibility)
  const handleDateChange = (name: string, value: string) => {
    onStateChange({
      target: {
        name,
        value
      }
    });
  };
  
  // Handle multiple objective selection
  const handleObjectivesChange = (selectedObjectives: MultiSelectOption[]) => {
    // Extract IDs from the selected objectives
    const objectiveIds = selectedObjectives.map(obj => obj.id);
    
    onStateChange({
      target: {
        name: 'objective_ids',
        value: objectiveIds
      }
    });
  };
  
  // Handle multiple group selection
  const handleGroupsChange = (selectedGroups: MultiSelectOption[]) => {
    // Extract IDs from the selected groups
    const groupIds = selectedGroups.map(group => group.id);
    
    onStateChange({
      target: {
        name: 'group_ids',
        value: groupIds
      }
    });
  };
  
  // No longer need epic state change handler as state is always "todo"

  return (
    <CyberCard sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
        Epic
      </Typography>
      <CyberTextField
        fullWidth
        margin="normal"
        label="Epic Name"
        name="name"
        value={epicDetails.name}
        onChange={onChange}
        required
        helperText="You can use {{Variable}} syntax to define variables (e.g., '{{Feature}} Implementation')"
        cornerClip
      />
      <CyberTextField
        fullWidth
        margin="normal"
        label="Epic Description"
        name="description"
        value={epicDetails.description}
        onChange={onChange}
        multiline
        rows={3}
        helperText="You can use {{Variable}} syntax here too"
        cornerClip
      />
      
      {/* Teams Selector */}
      {shortcutApi.hasApiToken && (
        <Box sx={{ mt: 2 }}>
          <GroupMultiSelect
            value={epicDetails.group_ids || []}
            onChange={handleGroupsChange}
            shortcutApi={shortcutApi}
          />
        </Box>
      )}
      
      {/* API-based selectors - only show when API token is available */}
      {shortcutApi.hasApiToken && (
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, mt: 2 }}>
          <Box sx={{ flex: 1 }}>
            <MemberMultiSelect
              value={epicDetails.owner_ids || []}
              onChange={handleOwnersChange}
              shortcutApi={shortcutApi}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <ObjectiveMultiSelect
              value={epicDetails.objective_ids || []}
              onChange={handleObjectivesChange}
              shortcutApi={shortcutApi}
            />
          </Box>
        </Box>
      )}
      
      {apiTokenAlert && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please set up your Shortcut API token in Settings to use real epic states, owners, labels, and objectives.
        </Alert>
      )}
    </CyberCard>
  );
};

export default EpicDetailsEditor;
