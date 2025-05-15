/**
 * Web Utilities
 * 
 * This file provides replacements for Electron-specific functionality in a web context.
 */

import templatesService from '../services/templatesService';

// Template management functions
export async function getTemplates() {
  return templatesService.getAllTemplates();
}

export async function saveTemplate(template: any) {
  return templatesService.updateTemplate(template);
}

export async function deleteTemplate(templateId: string) {
  return templatesService.removeTemplate(templateId);
}

// Import/Export functions
export async function exportTemplates() {
  await templatesService.exportTemplatesToFile();
  return true;
}

export async function importTemplates() {
  return templatesService.importTemplatesFromFile();
}

// Check if running in a web browser (always true in this version)
export function isWebContext(): boolean {
  return true;
}

// Function to open a URL in a new tab
export function openExternalLink(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}

// Function to display an alert using browser's native dialog
export function showAlert(message: string): void {
  alert(message);
}

// Function to display a confirmation dialog
export function showConfirmDialog(message: string): boolean {
  return window.confirm(message);
}
