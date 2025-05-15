/**
 * Template API Utilities
 * 
 * This file provides a wrapper for template management functions
 * using browser-based storage via Dexie.
 */

import { Template } from '../types';
import { 
  getTemplates as dbGetTemplates,
  saveTemplate as dbSaveTemplate,
  deleteTemplate as dbDeleteTemplate,
  exportTemplates as dbExportTemplates,
  importTemplates as dbImportTemplates
} from '../services/dexieService';

// Template management functions
export async function getTemplates(): Promise<Template[]> {
  return dbGetTemplates();
}

export async function saveTemplate(template: Template): Promise<Template> {
  return dbSaveTemplate(template);
}

export async function deleteTemplate(templateId: string): Promise<string> {
  return dbDeleteTemplate(templateId);
}

// Import/Export functions - Modified for web
export async function exportTemplates(): Promise<boolean> {
  try {
    const blob = await dbExportTemplates();
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortcut-templates-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    return true;
  } catch (error) {
    console.error('Failed to export templates:', error);
    return false;
  }
}

export async function importTemplates(): Promise<Template[] | null> {
  try {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    // Promise to handle file selection
    const filePromise = new Promise<Template[] | null>((resolve) => {
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        
        if (!files || files.length === 0) {
          resolve(null);
          return;
        }
        
        const file = files[0];
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          try {
            const imported = await dbImportTemplates(content);
            resolve(imported);
          } catch (error) {
            console.error('Error importing templates:', error);
            resolve(null);
          }
        };
        
        reader.onerror = () => {
          console.error('Error reading file');
          resolve(null);
        };
        
        reader.readAsText(file);
      };
    });
    
    // Trigger click on input element
    input.click();
    
    // Return promise result
    return filePromise;
  } catch (error) {
    console.error('Failed to import templates:', error);
    return null;
  }
}
