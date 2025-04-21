# Shortcut Shortcut

A desktop application for creating and managing templates for epics and stories in Shortcut (formerly Clubhouse).

## Features

- Create, edit, and delete epic templates
- Each template includes epic details and story templates
- Support for variable placeholders that can be replaced when applying a template
- Templates are stored locally
- Import/export functionality for sharing templates
- Apply templates to create epics and stories in Shortcut via API

## Development

### Prerequisites

- Node.js (v18+ recommended)
- Yarn package manager

### Setup

1. Clone the repository
2. Install dependencies:
```bash
yarn install
```

### Running the app

Start the development server:
```bash
yarn dev
```

### Building the app

Build for the current platform:
```bash
yarn build
```

Build for a specific platform:
```bash
yarn build:win    # Windows
yarn build:mac    # macOS
yarn build:linux  # Linux
```

## Usage

### Creating Templates

1. Click "New Template" in the header
2. Fill in template details and epic information
3. Add story templates by clicking "Add Story"
4. Save your template

### Using Variables

You can use variable placeholders in your templates with double curly braces:
- Example: `{{Feature Name}}`

These variables will be replaceable when applying the template.

### Applying Templates

1. Navigate to the Templates list
2. Click the "Apply" button on any template
3. Fill in the variable values
4. Enter your Shortcut API token
5. Select a project and workflow
6. Click "Apply Template"

### Importing/Exporting Templates

- To export templates, click the "Export" button on the Templates list
- To import templates, click the "Import" button and select a JSON file

## Tech Stack

- Electron for cross-platform desktop app
- React for UI
- Material UI for component library
- TypeScript for type safety
- Electron Store for local data persistence

## Documentation

Additional documentation can be found in the `docs` directory:

- [Electron Optimization Guide](docs/electron-optimization-guide.md) - Strategies for reducing app size
