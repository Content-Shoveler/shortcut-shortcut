import { Template } from '../types';

/**
 * Standard API response format for external API interactions
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  status?: number;
  data?: T;
}

/**
 * Interface for template operations
 */
export interface TemplateOperations {
  getTemplates: () => Promise<Template[]>;
  saveTemplate: (template: Template) => Promise<Template>;
  deleteTemplate: (templateId: string) => Promise<string>;
  exportTemplates: () => Promise<Blob>;
  importTemplates: (jsonData: string) => Promise<Template[]>;
}
