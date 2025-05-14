/**
 * File Access Service
 * 
 * This service provides a unified interface for file operations across
 * Electron and Web environments. It uses the appropriate implementation
 * based on the detected environment.
 */

import { FeatureDetectionService, Feature } from './FeatureDetectionService';
import { isElectron, getElectronAPI } from '../../utils/environment';

/**
 * Options for opening a file
 */
export interface OpenFileOptions {
  multiple?: boolean;
  accept?: Record<string, string[]>; // e.g. { 'text/plain': ['.txt'] }
  excludeAcceptAllOption?: boolean; 
}

/**
 * Options for saving a file
 */
export interface SaveFileOptions {
  suggestedName?: string;
  accept?: Record<string, string[]>;
  excludeAcceptAllOption?: boolean;
}

/**
 * Result of a file operation
 */
export interface FileOperationResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

/**
 * Service for handling file access operations
 */
export class FileAccessService {
  /**
   * Check if file access is available
   */
  static isFileAccessAvailable(): boolean {
    return FeatureDetectionService.isFeatureAvailable(Feature.FILE_SYSTEM_ACCESS);
  }
  
  /**
   * Open a file - works in both Electron and Web (where supported)
   */
  static async openFile(options: OpenFileOptions = {}): Promise<FileOperationResult<string>> {
    try {
      if (isElectron()) {
        return await this.openFileElectron(options);
      } else if ('showOpenFilePicker' in window) {
        return await this.openFileWeb(options);
      } else {
        return this.openFileWebFallback(options);
      }
    } catch (error: any) {
      console.error('Error opening file:', error);
      return {
        success: false,
        error: new Error(`Failed to open file: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Save a file - works in both Electron and Web (where supported)
   */
  static async saveFile(content: string, options: SaveFileOptions = {}): Promise<FileOperationResult<void>> {
    try {
      if (isElectron()) {
        return await this.saveFileElectron(content, options);
      } else if ('showSaveFilePicker' in window) {
        return await this.saveFileWeb(content, options);
      } else {
        return this.saveFileWebFallback(content, options);
      }
    } catch (error: any) {
      console.error('Error saving file:', error);
      return {
        success: false,
        error: new Error(`Failed to save file: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Import JSON from a file
   */
  static async importJSON<T>(options: OpenFileOptions = {}): Promise<FileOperationResult<T>> {
    // Set options for JSON files
    const jsonOptions: OpenFileOptions = {
      ...options,
      accept: {
        'application/json': ['.json']
      }
    };

    try {
      // Open the file
      const result = await this.openFile(jsonOptions);
      
      if (!result.success || !result.data) {
        return {
          success: false,
          error: result.error || new Error('Failed to open JSON file')
        };
      }
      
      // Parse the JSON content
      const data = JSON.parse(result.data) as T;
      
      return {
        success: true,
        data
      };
    } catch (error: any) {
      console.error('Error importing JSON:', error);
      return {
        success: false,
        error: new Error(`Failed to import JSON: ${error.message || 'Invalid JSON'}`)
      };
    }
  }

  /**
   * Export JSON to a file
   */
  static async exportJSON<T>(data: T, options: SaveFileOptions = {}): Promise<FileOperationResult<void>> {
    // Set options for JSON files
    const jsonOptions: SaveFileOptions = {
      ...options,
      suggestedName: options.suggestedName || 'export.json',
      accept: {
        'application/json': ['.json']
      }
    };

    try {
      // Convert data to JSON string
      const content = JSON.stringify(data, null, 2);
      
      // Save the file
      return await this.saveFile(content, jsonOptions);
    } catch (error: any) {
      console.error('Error exporting JSON:', error);
      return {
        success: false,
        error: new Error(`Failed to export JSON: ${error.message || 'Unknown error'}`)
      };
    }
  }

  // ---- PRIVATE IMPLEMENTATION METHODS ----

  /**
   * Open a file using Electron
   */
  private static async openFileElectron(options: OpenFileOptions): Promise<FileOperationResult<string>> {
    const api = getElectronAPI();
    if (!api) {
      return {
        success: false,
        error: new Error('Electron API is not available')
      };
    }

    try {
      // Currently, we only have a specific implementation for templates
      // In a real implementation, we would add a generic file open method to the Electron API
      // For now, we'll simulate it with the importTemplates method
      const templates = await api.importTemplates();
      
      if (templates === null) {
        return {
          success: false,
          error: new Error('No file selected')
        };
      }
      
      // For this simulation, we'll just return the templates as a string
      return {
        success: true,
        data: JSON.stringify(templates)
      };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Electron file open error: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Save a file using Electron
   */
  private static async saveFileElectron(content: string, options: SaveFileOptions): Promise<FileOperationResult<void>> {
    const api = getElectronAPI();
    if (!api) {
      return {
        success: false,
        error: new Error('Electron API is not available')
      };
    }

    try {
      // Currently, we only have a specific implementation for templates
      // In a real implementation, we would add a generic file save method to the Electron API
      // For now, we'll simulate it with the exportTemplates method
      const success = await api.exportTemplates();
      
      return {
        success: success,
        error: success ? undefined : new Error('Failed to save file in Electron')
      };
    } catch (error: any) {
      return {
        success: false,
        error: new Error(`Electron file save error: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Open a file using Web File System Access API
   */
  private static async openFileWeb(options: OpenFileOptions): Promise<FileOperationResult<string>> {
    try {
      // Use the File System Access API
      const pickerOpts: any = {
        multiple: options.multiple || false,
        types: []
      };
      
      // Add accept types if provided
      if (options.accept) {
        pickerOpts.types = Object.entries(options.accept).map(([description, extensions]) => ({
          description,
          accept: {
            [description]: extensions
          }
        }));
      }
      
      // Show the file picker
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
      const file = await fileHandle.getFile();
      const content = await file.text();
      
      return {
        success: true,
        data: content
      };
    } catch (error: any) {
      // User cancelled = AbortError
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: new Error('File selection cancelled')
        };
      }
      
      return {
        success: false,
        error: new Error(`Web file open error: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Save a file using Web File System Access API
   */
  private static async saveFileWeb(content: string, options: SaveFileOptions): Promise<FileOperationResult<void>> {
    try {
      // Use the File System Access API
      const pickerOpts: any = {
        suggestedName: options.suggestedName || 'export.txt',
        types: []
      };
      
      // Add accept types if provided
      if (options.accept) {
        pickerOpts.types = Object.entries(options.accept).map(([description, extensions]) => ({
          description,
          accept: {
            [description]: extensions
          }
        }));
      }
      
      // Show the save file picker
      const fileHandle = await window.showSaveFilePicker(pickerOpts);
      
      // Create a writable stream and write the content
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      
      return {
        success: true
      };
    } catch (error: any) {
      // User cancelled = AbortError
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: new Error('File save cancelled')
        };
      }
      
      return {
        success: false,
        error: new Error(`Web file save error: ${error.message || 'Unknown error'}`)
      };
    }
  }

  /**
   * Fallback method for opening files in browsers without File System Access API
   */
  private static openFileWebFallback(options: OpenFileOptions): Promise<FileOperationResult<string>> {
    return new Promise((resolve) => {
      // Create an input element
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = options.multiple || false;
      
      // Set accept attribute if provided
      if (options.accept) {
        const extensions = Object.values(options.accept).flat();
        input.accept = extensions.join(',');
      }
      
      // Listen for the change event
      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        
        if (!files || files.length === 0) {
          resolve({
            success: false,
            error: new Error('No file selected')
          });
          return;
        }
        
        try {
          const file = files[0];
          const content = await this.readFileAsText(file);
          
          resolve({
            success: true,
            data: content
          });
        } catch (error: any) {
          resolve({
            success: false,
            error: new Error(`Error reading file: ${error.message || 'Unknown error'}`)
          });
        }
      };
      
      // Trigger the file picker
      input.click();
    });
  }

  /**
   * Fallback method for saving files in browsers without File System Access API
   */
  private static saveFileWebFallback(content: string, options: SaveFileOptions): Promise<FileOperationResult<void>> {
    try {
      // Create a blob
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = options.suggestedName || 'download.txt';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
      
      return Promise.resolve({
        success: true
      });
    } catch (error: any) {
      return Promise.resolve({
        success: false,
        error: new Error(`Web file save fallback error: ${error.message || 'Unknown error'}`)
      });
    }
  }

  /**
   * Helper method to read a file as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      reader.readAsText(file);
    });
  }
}
