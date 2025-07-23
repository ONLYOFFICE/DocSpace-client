# Translation Management App

This application provides a web interface for managing i18n localization files according to a fixed JSON structure. It allows you to manage translation keys across multiple projects, languages, and namespaces, with integrated AI translation capabilities via Ollama.

## Features

- Project management with fixed mapping to locale directories
- Advanced language management (add/view/create language folders)
- Namespace management (add/view translation files)
- Translation key editing with intuitive interface
- Robust file validation and error handling
- Ollama integration for AI-powered translations
- Real-time updates via Socket.IO
- Docker support for easy deployment

## Structure

The application consists of two parts:

1. **Backend (Node.js/Fastify)**

   - RESTful API for managing translations
   - Socket.IO for real-time updates
   - Advanced file system operations for translation files
   - Comprehensive test runner for translation validation
   - Ollama API integration for AI-powered translations

2. **Frontend (Next.js)**
   - Modern UI with App Router and Tailwind CSS
   - Zustand for state management
   - Real-time updates with Socket.IO
   - Responsive design for all device sizes

## Configuration

### Environment Variables

The application is configured via environment variables in the `.env` file:

- `PORT`: The port for the backend server (default: 3001)
- `OLLAMA_API_URL`: URL for Ollama API (optional)
- `BASE_LANGUAGE`: The base language for translations (default: en)
- `DB_PATH`: Path to the SQLite database directory
- `DB_NAME`: Name of the SQLite database file

### Project Configuration

Fixed project mapping is defined in `backend/src/config/config.js`:

```javascript
const projectLocalesMap = {
  web: "public/locales",
  client: "public/locales",
  doceditor: "public/locales",
  login: "public/locales",
  management: "public/locales",
};
```

This mapping supports the enhanced folder structure with the public/locales directory pattern, allowing for advanced translation management features.

## Getting Started

### Prerequisites

- Node.js (v22+) and npm
- Python 3.6+ (for build script)
- Docker and Docker Compose
- Ollama installed locally for AI translations (optional)

### Installation & Running

#### Option 1: Using the convenience scripts (Recommended)

The easiest way to run the application locally is using the provided convenience scripts:

**For Windows:**

```bash
# From the translation-app directory
run.translation-app.bat
```

**For macOS/Linux:**

```bash
# From the translation-app directory
./run.translation-app.sh
```

These scripts will:

1. Check for Node.js installation
2. Install all necessary dependencies for backend and frontend
3. Run important metadata generation scripts:
   - `generate-metadata.js` - Creates metadata files for all translation keys
   - `save-meta-keys-usage.js` - Updates usage information for translation keys
   - `generate-auto-comments-metadata.js` - Generates AI-powered comments for keys
4. Start both the backend and frontend servers
5. Wait for the backend to fully initialize
6. Automatically open your browser to the application
7. Properly shut down all processes when you exit (Ctrl+C)

Once running, you can access:

- Frontend interface: http://localhost:3000
- Backend API: http://localhost:3001

#### Option 2: Using the Docker build script

For a containerized setup, you can use the provided build script:

```bash
python build.docker.py
```

This script will:

1. Install all necessary dependencies for backend, frontend, and tests
2. Configure environment variables automatically
3. Build and start Docker containers for the application
4. Set up the proper file structure for translations

#### Option 3: Manual Setup

If you prefer to set up manually:

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install test dependencies (required for translation validations):

```bash
cd ../tests
npm install
```

4. Configure the `.env` file with your DOCSPACE_PATH

5. Start the application using Docker Compose:

```bash
docker-compose up -d
```

### Running Tests

The application provides comprehensive test utilities to validate translation files. You can run tests directly from the UI or use the following commands:

```bash
# Run tests that check if all keys are translated (skipping base language)
npm run test:skip-base-languages

# Run tests that only validate base language files
npm run test:only-base-languages
```

### Using Ollama for Translations

To enable AI-powered translations:

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a language model (recommended: `ollama pull mistral`)
3. Run Ollama (`ollama serve`)
4. Set the `OLLAMA_API_URL` environment variable (defaults to http://localhost:11434)
5. Use the Translation Management UI to trigger translations

### Docker Support

The application is fully Dockerized for easy deployment:

- **Backend Container**: Runs the Fastify API server and handles file operations
- **Frontend Container**: Serves the Next.js application
- **Volume Mounting**: Preserves original file paths for accurate translation management
- **Environment Configuration**: All settings managed through `.env` file

To manage Docker containers manually:

```bash
# Start containers
docker-compose up -d

# Rebuild containers
docker-compose up -d --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

## API Routes

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:projectName` - Get a specific project

### Languages

- `GET /api/languages/:projectName` - Get all languages for a project
- `POST /api/languages/:projectName` - Add a new language

### Namespaces

- `GET /api/namespaces/:projectName/:language` - Get all namespaces for a language
- `POST /api/namespaces/:projectName` - Create a new namespace

### Translations

- `GET /api/translations/:projectName/:language/:namespace` - Get translations
- `PUT /api/translations/:projectName/:language/:namespace` - Update translations
- `PUT /api/translations/:projectName/:language/:namespace/key` - Update a single key

### Ollama

- `GET /api/ollama/models` - Get available Ollama models
- `POST /api/ollama/translate/key` - Translate a single key
- `POST /api/ollama/translate/namespace` - Translate all keys in a namespace

## File Structure

### Backend

```
backend/
  ├── src/
  │   ├── config/
  │   │   └── config.js       # Configuration including project mapping
  │   ├── routes/
  │   │   ├── projects.js     # Project routes
  │   │   ├── languages.js    # Language routes
  │   │   ├── namespaces.js   # Namespace routes
  │   │   ├── translations.js # Translation routes
  │   │   └── ollama.js       # Ollama integration routes
  │   ├── utils/
  │   │   └── fsUtils.js      # File system utilities
  │   └── index.js            # Main server file
  ├── .env                    # Environment variables
  └── package.json            # Dependencies
```

### Frontend

```
frontend/
  ├── app/
  │   ├── projects/
  │   │   └── [projectName]/  # Project page
  │   ├── layout.tsx          # Root layout
  │   └── page.tsx            # Home page
  ├── components/             # UI components
  ├── lib/                    # Utilities
  │   ├── api.ts              # API client
  │   └── socket.ts           # Socket.IO client
  ├── store/                  # Zustand stores
  ├── public/                 # Static assets
  └── package.json            # Dependencies
```

## Technical Details

- The backend directly manipulates JSON files in the specified directories
- All paths are resolved relative to `APP_ROOT_PATH`
- The base language (default: 'en') is used as the source for translations
- Socket.IO is used for real-time updates during translation operations
- Ollama provides AI translation capabilities with local language models

## Utility Scripts

The application includes several utility scripts in the `backend/src/scripts` directory that help manage translation metadata and quality:

### generate-metadata.js

A script that scans locales directories and generates metadata files for all translation keys, preserving existing metadata where available.

```bash
node src/scripts/generate-metadata.js
```

Features:

- Creates `.meta` directories with metadata for each translation key
- Preserves existing comments, usage data, and other metadata
- Tracks content hashes to detect changes
- Cleans up stale metadata files
- Provides detailed statistics about processed keys

### save-meta-keys-usage.js

Scans the codebase to find where translation keys are used and updates the usage metadata.

```bash
node src/scripts/save-meta-keys-usage.js
```

Features:

- Scans JavaScript/TypeScript files for translation key usage
- Identifies file paths, line numbers, and code context
- Updates metadata files with usage information
- Supports multiple key formats (t(), i18nKey, etc.)
- Handles workspace-specific translations

### generate-auto-comments-metadata.js

Generates automatic comments for translation keys using Ollama AI models to provide context for translators.

```bash
node src/scripts/generate-auto-comments-metadata.js
```

Features:

- Uses Ollama to generate descriptive comments for translation keys
- Analyzes key usage contexts to create meaningful descriptions
- Only generates comments for keys without existing comments
- Supports retry mechanisms for API failures
- Works with configurable language models

### verify-translations-spell-check.js

Verifies translations against the English version using Ollama AI to identify spelling, grammar, and other issues.

```bash
node src/scripts/verify-translations-spell-check.js [languages]
```

Features:

- Compares non-English translations with English originals
- Uses AI to detect spelling errors, grammar issues, and mistranslations
- Updates metadata with identified issues
- Supports filtering by specific languages
- Provides detailed verification statistics
