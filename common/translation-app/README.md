# Translation Management App

This application provides a web interface for managing i18n localization files according to a fixed JSON structure. It allows you to manage translation keys across multiple projects, languages, and namespaces, with integrated AI translation capabilities via Ollama.

## Features

- Project management with fixed mapping to locale directories
- Language management (add/view languages)
- Namespace management (add/view translation files)
- Translation key editing with intuitive interface
- Ollama integration for AI-powered translations
- Real-time updates via Socket.IO

## Structure

The application consists of two parts:

1. **Backend (Node.js/Fastify)**
   - RESTful API for managing translations
   - Socket.IO for real-time updates
   - Direct file system operations for translation files
   - Ollama API integration

2. **Frontend (Next.js)**
   - Modern UI with App Router and Tailwind CSS
   - Zustand for state management
   - Real-time updates with Socket.IO

## Configuration

### Backend

The backend is configured via environment variables:

- `APP_ROOT_PATH`: The absolute path to the root directory (containing public/ and packages/)
- `PORT`: The port for the backend server (default: 3001)
- `OLLAMA_API_URL`: URL for Ollama API (default: http://localhost:11434)
- `BASE_LANGUAGE`: The base language for translations (default: en)

Fixed project mapping is defined in `config.js`:

```javascript
const projectLocalesMap = {
  "Common": "public/locales",
  "Client": "packages/client/public/locales",
  "DocEditor": "packages/doceditor/public/locales",
  "Login": "packages/login/public/locales",
  "Management": "packages/management/public/locales"
};
```

### Frontend

The frontend is configured via environment variables:

- `API_URL`: Backend API URL (default: http://localhost:3001/api)
- `WS_URL`: WebSocket URL (default: http://localhost:3001)

## Getting Started

### Prerequisites

- Node.js (v16+) and npm
- Ollama installed locally for AI translations (optional)

### Installation

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

### Running the Application

1. Start the backend server:

```bash
cd backend
npm run dev
```

2. Start the frontend development server:

```bash
cd frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Using Ollama for Translations

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Pull a language model (recommended: `ollama pull mistral`)
3. Run Ollama (`ollama serve`)
4. Use the translation features in the web UI

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
