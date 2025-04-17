/**
 * Electron API Utilities
 * 
 * This file provides a typed wrapper for Electron IPC calls exposed
 * through the preload script to the renderer process.
 */

import { Template, ElectronAPI } from '../types';

// This ensures we only access the API if it exists
// We're in the renderer process, so we need to access the exposed API
// through the window object
const electronAPI: ElectronAPI = (window as any).electronAPI;

// Template management functions
export async function getTemplates(): Promise<Template[]> {
  return electronAPI.getTemplates();
}

export async function saveTemplate(template: Template): Promise<Template> {
  return electronAPI.saveTemplate(template);
}

export async function deleteTemplate(templateId: string): Promise<string> {
  return electronAPI.deleteTemplate(templateId);
}

// Import/Export functions
export async function exportTemplates(): Promise<boolean> {
  return electronAPI.exportTemplates();
}

export async function importTemplates(): Promise<Template[] | null> {
  return electronAPI.importTemplates();
}

// Check if Electron API is available (useful for debugging)
export function isElectronAPIAvailable(): boolean {
  return Boolean(electronAPI);
}
