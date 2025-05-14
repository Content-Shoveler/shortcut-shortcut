import React, { useState } from 'react';
import { Button, Stack, Alert, Typography, Tooltip, Paper, Box } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

import { useFeatureDetection } from '../../hooks/useFeatureDetection';
import { Feature } from '../../services/features/FeatureDetectionService';
import { FileAccessService } from '../../services/features/FileAccessService';
import { templateStorage } from '../../services/storage/TemplateStorage';
import { Template } from '../../types';

/**
 * Template Import/Export Component
 * 
 * This component demonstrates the Feature Compatibility Layer by providing
 * functionality to import and export templates in both Electron and Web environments.
 * It uses different approaches based on feature availability.
 */
export const TemplateImportExport: React.FC = () => {
  const [importStatus, setImportStatus] = useState<{
    success?: boolean;
    message?: string;
    count?: number;
  }>({});
  
  const [exportStatus, setExportStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});

  // Use our custom hook to detect environment and features
  const {
    isElectron,
    isWeb,
    canAccessFileSystem: hasFileAccess,
    browserType
  } = useFeatureDetection();

  /**
   * Import templates from a JSON file
   */
  const handleImport = async () => {
    try {
      setImportStatus({ message: 'Importing templates...' });
      
      // Use our abstracted FileAccessService to import JSON
      const result = await FileAccessService.importJSON<Template[]>();
      
      if (!result.success || !result.data) {
        // User cancelled or error occurred
        if (result.error?.message === 'File selection cancelled') {
          setImportStatus({});
        } else {
          setImportStatus({
            success: false,
            message: result.error?.message || 'Failed to import templates'
          });
        }
        return;
      }
      
      // Validate imported data
      const importedTemplates = result.data;
      if (!Array.isArray(importedTemplates)) {
        setImportStatus({
          success: false,
          message: 'Invalid template format: Expected an array of templates'
        });
        return;
      }
      
      // Save imported templates
      const savedTemplates = await templateStorage.importTemplates(importedTemplates);
      
      // Update status
      setImportStatus({
        success: true,
        message: `Successfully imported templates`,
        count: savedTemplates.length
      });
    } catch (error: any) {
      console.error('Error importing templates:', error);
      setImportStatus({
        success: false,
        message: `Error importing templates: ${error.message || 'Unknown error'}`
      });
    }
  };

  /**
   * Export templates to a JSON file
   */
  const handleExport = async () => {
    try {
      setExportStatus({ message: 'Exporting templates...' });
      
      // Get templates from storage
      const templates = await templateStorage.exportTemplates();
      
      if (!templates || templates.length === 0) {
        setExportStatus({
          success: false,
          message: 'No templates to export'
        });
        return;
      }
      
      // Use our abstracted FileAccessService to export JSON
      const result = await FileAccessService.exportJSON(templates, {
        suggestedName: 'shortcut-templates.json'
      });
      
      if (!result.success) {
        // User cancelled or error occurred
        if (result.error?.message === 'File save cancelled') {
          setExportStatus({});
        } else {
          setExportStatus({
            success: false,
            message: result.error?.message || 'Failed to export templates'
          });
        }
        return;
      }
      
      // Update status
      setExportStatus({
        success: true,
        message: `Successfully exported ${templates.length} templates`
      });
    } catch (error: any) {
      console.error('Error exporting templates:', error);
      setExportStatus({
        success: false,
        message: `Error exporting templates: ${error.message || 'Unknown error'}`
      });
    }
  };

  // Get the appropriate environment label
  const environmentLabel = isElectron ? 'Electron' : 'Web';
  
  // Get the appropriate file access method description
  const fileAccessMethod = hasFileAccess 
    ? 'Native File System'
    : isElectron 
      ? 'Electron Dialog'
      : 'Browser File Input/Download';

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h5" gutterBottom>
        Template Import/Export
        <Tooltip title={`Running in ${environmentLabel} environment using ${fileAccessMethod}`}>
          <InfoIcon sx={{ ml: 1, fontSize: '0.9em', verticalAlign: 'middle', opacity: 0.7 }} />
        </Tooltip>
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" paragraph>
          This component demonstrates the Feature Compatibility Layer by providing
          the same functionality in both Electron and Web environments.
          {!hasFileAccess && !isElectron && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              Note: Your browser doesn't support the modern File System Access API. 
              A legacy method will be used instead.
            </Typography>
          )}
        </Typography>
      </Box>
      
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<UploadFileIcon />}
          onClick={handleImport}
        >
          Import Templates
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export Templates
        </Button>
      </Stack>
      
      {importStatus.message && (
        <Alert 
          severity={importStatus.success === undefined ? 'info' : importStatus.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
        >
          {importStatus.message}
          {importStatus.count !== undefined && (
            <Typography variant="body2">
              Imported {importStatus.count} templates
            </Typography>
          )}
        </Alert>
      )}
      
      {exportStatus.message && (
        <Alert 
          severity={exportStatus.success === undefined ? 'info' : exportStatus.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
        >
          {exportStatus.message}
        </Alert>
      )}
    </Paper>
  );
};
