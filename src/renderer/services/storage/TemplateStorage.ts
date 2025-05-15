/**
 * Template Storage Service
 * 
 * This service provides methods for managing templates using
 * the underlying storage abstraction.
 */

import { v4 as uuidv4 } from 'uuid';
import { Template } from '../../types';
import { StorageService, createStorageService } from './StorageService';

/**
 * Service for managing templates
 */
export class TemplateStorage {
  private storage: StorageService;
  
  constructor() {
    this.storage = createStorageService();
  }
  
  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    return this.storage.get('templates', []);
  }
  
  /**
   * Get a template by ID
   */
  async getTemplate(id: string): Promise<Template | null> {
    const templates = await this.getTemplates();
    return templates.find(template => template.id === id) || null;
  }
  
/**
 * Save a template (create or update)
 */
async saveTemplate(template: Template): Promise<Template> {
  console.log('Saving template:', template.name);
  
  try {
    const templates = await this.getTemplates();
    
    // Check if template already exists
    const index = templates.findIndex(t => t.id === template.id);
    
    let savedTemplate: Template;
    
    if (index >= 0) {
      // Update existing template
      console.log(`Updating existing template with id ${template.id}`);
      templates[index] = template;
      savedTemplate = template;
    } else {
      // Create new template with ID if not provided
      const newTemplate = {
        ...template,
        id: template.id || uuidv4()
      };
      console.log(`Creating new template with id ${newTemplate.id}`);
      templates.push(newTemplate);
      savedTemplate = newTemplate;
    }
    
    // Save templates
    console.log(`Saving ${templates.length} templates to storage`);
    await this.storage.set('templates', templates);
    
    // Also save to localStorage as a backup
    try {
      console.log('Backing up templates to localStorage');
      localStorage.setItem('templates', JSON.stringify(templates));
    } catch (localStorageError) {
      console.warn('Failed to backup templates to localStorage:', localStorageError);
    }
    
    console.log('Template saved successfully');
    return savedTemplate;
  } catch (error) {
    console.error('Error saving template:', error);
    
    // Try to save directly to localStorage as a fallback
    try {
      console.log('Attempting to save template to localStorage as fallback');
      const existingTemplatesJson = localStorage.getItem('templates') || '[]';
      const existingTemplates = JSON.parse(existingTemplatesJson) as Template[];
      
      let savedTemplate: Template;
      const index = existingTemplates.findIndex(t => t.id === template.id);
      
      if (index >= 0) {
        existingTemplates[index] = template;
        savedTemplate = template;
      } else {
        const newTemplate = {
          ...template,
          id: template.id || uuidv4()
        };
        existingTemplates.push(newTemplate);
        savedTemplate = newTemplate;
      }
      
      localStorage.setItem('templates', JSON.stringify(existingTemplates));
      console.log('Template saved to localStorage successfully');
      return savedTemplate;
    } catch (fallbackError) {
      console.error('Failed to save template using fallback:', fallbackError);
      throw error; // Re-throw the original error
    }
  }
}
  
  /**
   * Delete a template by ID
   */
  async deleteTemplate(id: string): Promise<boolean> {
    const templates = await this.getTemplates();
    const filteredTemplates = templates.filter(t => t.id !== id);
    
    // Check if a template was removed
    if (filteredTemplates.length === templates.length) {
      return false;
    }
    
    // Save the updated templates
    await this.storage.set('templates', filteredTemplates);
    return true;
  }
  
  /**
   * Import templates from a JSON file
   * @param importedTemplates Templates to import
   * @param overwrite Whether to overwrite existing templates with the same ID
   */
  async importTemplates(importedTemplates: Template[], overwrite: boolean = true): Promise<Template[]> {
    if (!Array.isArray(importedTemplates) || importedTemplates.length === 0) {
      return [];
    }
    
    const currentTemplates = await this.getTemplates();
    
    // Create a map of current templates by ID for quick lookup
    const templateMap = new Map<string, Template>();
    currentTemplates.forEach(template => {
      templateMap.set(template.id, template);
    });
    
    // Process imported templates
    const result: Template[] = [];
    for (const importedTemplate of importedTemplates) {
      // Ensure the template has an ID
      if (!importedTemplate.id) {
        importedTemplate.id = uuidv4();
      }
      
      // Check if the template already exists
      if (templateMap.has(importedTemplate.id)) {
        if (overwrite) {
          // Update existing template
          templateMap.set(importedTemplate.id, importedTemplate);
        }
      } else {
        // Add new template
        templateMap.set(importedTemplate.id, importedTemplate);
      }
      
      result.push(importedTemplate);
    }
    
    // Update templates
    const updatedTemplates = Array.from(templateMap.values());
    await this.storage.set('templates', updatedTemplates);
    
    return result;
  }
  
  /**
   * Export all templates
   */
  async exportTemplates(): Promise<Template[]> {
    return this.getTemplates();
  }
}

/**
 * Create a singleton instance of the TemplateStorage
 */
export const templateStorage = new TemplateStorage();
