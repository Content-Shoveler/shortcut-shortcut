import { v4 as uuidv4 } from 'uuid';
import { Template, getTemplates, saveTemplate, deleteTemplate, exportTemplates, importTemplates } from './dexieService';

// Function to get all templates
export async function getAllTemplates(): Promise<Template[]> {
  return getTemplates();
}

// Function to get a template by ID
export async function getTemplateById(id: string): Promise<Template | undefined> {
  const templates = await getTemplates();
  return templates.find(template => template.id === id);
}

// Function to create a new template
export async function createTemplate(templateData: Omit<Template, 'id'>): Promise<Template> {
  const newTemplate: Template = {
    ...templateData,
    id: uuidv4(),
  };
  
  return saveTemplate(newTemplate);
}

// Function to update an existing template
export async function updateTemplate(template: Template): Promise<Template> {
  return saveTemplate(template);
}

// Function to delete a template
export async function removeTemplate(templateId: string): Promise<string> {
  return deleteTemplate(templateId);
}

// Function to export templates to a file
export async function exportTemplatesToFile(): Promise<void> {
  const blob = await exportTemplates();
  
  // Create a download link and trigger download
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = 'shortcut-templates.json';
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

// Function to import templates from a file
export async function importTemplatesFromFile(): Promise<Template[] | null> {
  return new Promise((resolve, reject) => {
    // Create a file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
      const target = event.target as HTMLInputElement;
      const files = target.files;
      
      if (files && files.length > 0) {
        try {
          const file = files[0];
          const content = await readFileAsText(file);
          const templates = await importTemplates(content);
          
          // Clean up
          document.body.removeChild(fileInput);
          resolve(templates);
        } catch (error) {
          console.error('Failed to import templates:', error);
          reject(error);
        }
      } else {
        // User canceled the file selection
        document.body.removeChild(fileInput);
        resolve(null);
      }
    });
    
    // Trigger file selection dialog
    fileInput.click();
  });
}

// Helper function to read file content as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        resolve(event.target.result);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(reader.error);
    };
    
    reader.readAsText(file);
  });
}

export default {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  removeTemplate,
  exportTemplatesToFile,
  importTemplatesFromFile,
};
