# Shortcut Shortcut

A sophisticated desktop application for creating, managing, and applying templates for epics and stories in Shortcut (formerly Clubhouse). Boost your team's productivity by standardizing common epic structures and workflows.

![Shortcut Shortcut](https://i.imgur.com/placeholder.png) <!-- Placeholder for screenshot -->

## 🚀 Features

- **Template Management**: Create, edit, duplicate, and delete epic templates
- **Rich Template Structure**: Define epic details with fully customizable stories and tasks
- **Variable System**: Insert dynamic variables that get replaced when applying templates
- **Cyberpunk UI**: Modern, sleek interface with customizable appearance settings
- **Local Storage**: Templates stored locally for privacy and quick access
- **Import/Export**: Share templates with your team via JSON export/import
- **Shortcut API Integration**: Apply templates directly to your Shortcut workspace
- **Intelligent Caching**: API responses cached to improve performance

## 🏗️ Architecture

Shortcut Shortcut is built with Electron and React, using a modern architecture:

```
├── main process (src/main)
│   ├── Electron configuration
│   ├── Local storage (electron-store)
│   ├── Shortcut API client
│   └── IPC handlers
└── renderer process (src/renderer)
    ├── React application
    │   ├── Pages
    │   ├── Components
    │   │   └── Cyberpunk UI components
    │   └── Template editor/application
    ├── State management (React Context)
    └── API hooks & utilities
```

### Main Process

The main process (`src/main/main.ts`) handles:
- Application lifecycle events
- Local storage operations via electron-store
- Shortcut API communication
- IPC (Inter-Process Communication) with the renderer

### Renderer Process

The renderer process contains the React application with:
- React components and pages
- Custom Cyberpunk UI component library
- Context-based state management
- Hooks for API communication

### Data Flow

1. User creates/edits templates in the UI
2. Changes are saved to electron-store via IPC
3. When applying templates, user provides variable values
4. Application communicates with Shortcut API via IPC
5. Results are displayed in the UI

## 💻 Development

### Prerequisites

- Node.js (v18+ recommended)
- Yarn package manager
- Basic knowledge of Electron, React, and TypeScript

### Setup

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

### Running the App

Start the development server:
```bash
yarn dev
```

This will:
- Start webpack in development mode
- Launch Electron with hot reloading
- Open Developer Tools automatically

### Project Structure

```
├── src/
│   ├── main/               # Electron main process
│   │   ├── main.ts         # Main entry point
│   │   └── preload.ts      # Preload script
│   └── renderer/           # React application
│       ├── assets/         # Static assets
│       ├── components/     # React components
│       │   ├── cyberpunk/  # Cyberpunk UI components
│       │   └── ...
│       ├── hooks/          # Custom React hooks
│       ├── pages/          # Application pages
│       ├── store/          # Context providers
│       ├── types/          # TypeScript definitions
│       ├── utils/          # Utility functions
│       ├── App.tsx         # Main React component
│       └── index.tsx       # Renderer entry point
├── public/                 # Static files
├── scripts/                # Build scripts
└── shortcut_docs/          # Shortcut API documentation
```

## 🔄 Template System

### Template Structure

Each template consists of:

```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  epicDetails: EpicDetails;
  storyTemplates: StoryTemplate[];
  variables: string[];
}
```

- **Epic Details**: Basic information about the epic
- **Story Templates**: Array of story templates within the epic
- **Variables**: Dynamic placeholders extracted from epic and story content

### Variable System

Variables are automatically extracted from epic and story content using regex:

```typescript
const extractVariables = (text: string): string[] => {
  const matches = text.match(/{{(.*?)}}/g) || [];
  return matches.map(match => match.replace('{{', '').replace('}}', ''))
    .filter((value, index, self) => self.indexOf(value) === index);
};
```

When applying a template, variables are replaced with user-provided values:

```typescript
const replaceVariables = (text: string, variables: VariableMapping): string => {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};
```

## 🔌 Shortcut API Integration

### API Client

The application communicates with the Shortcut API through:

1. **Main Process**: API requests via Axios
2. **Preload Script**: Secure bridge between main and renderer
3. **Custom Hooks**: React hooks for API operations with caching

### Authentication

API tokens are:
- Provided by the user in Settings
- Stored securely in the local settings
- Validated before use
- Used to authenticate all API requests

### Caching

API responses are cached to improve performance using a custom caching system:

- **Cache Key**: Generated based on endpoint and parameters
- **Expiration**: Automatic cache invalidation based on TTL
- **Manual Invalidation**: Cache cleared on relevant operations

## 🔧 Building and Distribution

### Building for Production

Build for all platforms:
```bash
yarn build
```

Platform-specific builds:
```bash
yarn build:win    # Windows
yarn build:mac    # macOS
yarn build:linux  # Linux
```

### Optimization Techniques

The application uses several optimization techniques:

- **Asset Optimization**: Minimize CSS and JavaScript
- **Dependency Management**: Careful selection of dependencies
- **Code Splitting**: Load only what's needed
- **Electron Optimization**: See the [Electron Optimization Guide](docs/electron-optimization-guide.md)

## 🧩 Advanced Development

### Adding New Template Fields

1. Update the `Template` interface in `src/renderer/types.ts`
2. Modify the template editor components accordingly
3. Update the API integration to send the new fields

### Creating Custom Cyberpunk Components

The application uses a custom Cyberpunk UI component system:

1. Create a new component in `src/renderer/components/cyberpunk/`
2. Extend the base styles and animations
3. Export from the index file

### Extending API Integration

To add new Shortcut API endpoints:

1. Add handler in `src/main/main.ts`
2. Expose in `src/main/preload.ts`
3. Create/update hook in `src/renderer/hooks/useShortcutApi.ts`

## 📄 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - see the LICENSE file for details.
