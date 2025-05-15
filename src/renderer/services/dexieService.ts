import Dexie from 'dexie';

// Define the interface for our templates (copied from main process)
export interface Template {
  id: string;
  name: string;
  description: string;
  epicDetails: {
    name: string;
    description: string;
    state: string;
  };
  storyTemplates: Array<{
    name: string;
    description: string;
    type: string;
    state: string;
    estimate?: number;
    labels?: string[];
    owner_ids?: string[];
    iteration_id?: number;
  }>;
  variables: string[];
}

// Define the interface for settings
export interface AppSettings {
  apiToken: string;
  theme: 'light' | 'dark' | 'system';
  cyberpunkMode: boolean;
  defaultWorkflowId?: string;
  [key: string]: any; // Allow for future settings
}

class ShortcutDatabase extends Dexie {
  templates: Dexie.Table<Template, string>;
  settings: Dexie.Table<AppSettings, string>;

  constructor() {
    super('ShortcutShortcutDB');
    
    this.version(1).stores({
      templates: 'id, name',
      settings: 'key'
    });
    
    this.templates = this.table('templates');
    this.settings = this.table('settings');
  }
  
  // Initialize default settings if none exist
  async initializeSettings(): Promise<void> {
    const defaultSettingsKey = 'appSettings';
    const settings = await this.settings.get(defaultSettingsKey);
    
    if (!settings) {
      const defaultSettings: AppSettings = {
        apiToken: '',
        theme: 'system',
        cyberpunkMode: true
      };
      
      await this.settings.put({
        ...defaultSettings,
        key: defaultSettingsKey
      });
    }
  }
}

// Create database instance
const db = new ShortcutDatabase();

// Initialize database and settings
db.initializeSettings().catch(err => console.error('Failed to initialize database settings:', err));

// Template functions
export async function getTemplates(): Promise<Template[]> {
  return db.templates.toArray();
}

export async function saveTemplate(template: Template): Promise<Template> {
  await db.templates.put(template);
  return template;
}

export async function deleteTemplate(templateId: string): Promise<string> {
  await db.templates.delete(templateId);
  return templateId;
}

// Settings functions
export async function getSetting<T>(key: string = 'appSettings'): Promise<T | null> {
  const settings = await db.settings.get(key);
  return settings as unknown as T;
}

export async function saveSetting(value: any, key: string = 'appSettings'): Promise<void> {
  await db.settings.put({
    ...value,
    key
  });
}

// Import/Export functions
export async function exportTemplates(): Promise<Blob> {
  const templates = await getTemplates();
  const blob = new Blob([JSON.stringify(templates, null, 2)], { type: 'application/json' });
  return blob;
}

export async function importTemplates(jsonData: string): Promise<Template[]> {
  try {
    const importedTemplates = JSON.parse(jsonData) as Template[];
    const currentTemplates = await getTemplates();
    
    // Merge templates, overwriting existing ones with the same ID
    const mergedTemplates = [...currentTemplates];
    
    await db.transaction('rw', db.templates, async () => {
      for (const importedTemplate of importedTemplates) {
        await db.templates.put(importedTemplate);
      }
    });
    
    return getTemplates();
  } catch (error) {
    console.error('Failed to import templates:', error);
    throw new Error('Failed to import templates');
  }
}

export default db;
