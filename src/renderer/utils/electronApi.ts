/**
 * Utility for accessing Electron API with proper TypeScript typing
 */

// Ensure our electron.d.ts file is properly included for TypeScript
// This file provides a clean interface for the rest of the application to use
// when accessing Electron's exposed API

/**
 * Get the API token from secure storage
 * @returns The API token or empty string if not set
 */
export async function getApiToken(): Promise<string> {
  // Using direct access to avoid TypeScript errors
  return (window as any).electronAPI.getApiToken();
}

/**
 * Set the API token in secure storage
 * @param token The API token to store
 * @returns True if successful
 */
export async function setApiToken(token: string): Promise<boolean> {
  // Using direct access to avoid TypeScript errors
  return (window as any).electronAPI.setApiToken(token);
}

/**
 * Validate the API token
 * @param token The API token to validate
 * @returns True if valid
 */
export async function validateApiToken(token: string): Promise<boolean> {
  // Using direct access to avoid TypeScript errors
  return (window as any).electronAPI.validateApiToken(token);
}

/**
 * Get templates from storage
 * @returns Array of templates
 */
export async function getTemplates() {
  return (window as any).electronAPI.getTemplates();
}

/**
 * Save a template to storage
 * @param template The template to save
 * @returns The saved template
 */
export async function saveTemplate(template: any) {
  return (window as any).electronAPI.saveTemplate(template);
}

/**
 * Delete a template from storage
 * @param templateId The ID of the template to delete
 * @returns The deleted template ID
 */
export async function deleteTemplate(templateId: string) {
  return (window as any).electronAPI.deleteTemplate(templateId);
}

/**
 * Export templates to a file
 * @returns True if successful
 */
export async function exportTemplates() {
  return (window as any).electronAPI.exportTemplates();
}

/**
 * Import templates from a file
 * @returns The imported templates or null if canceled
 */
export async function importTemplates() {
  return (window as any).electronAPI.importTemplates();
}
