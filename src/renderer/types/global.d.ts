// This file augments the global Window interface to include our Electron API
// Import the ElectronAPI interface from electron.d.ts
import { ElectronAPI } from './electron';

// Augment the Window interface
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

// Export empty object to make TypeScript treat this as a module
export {};
