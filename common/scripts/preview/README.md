# Preview Mode

Preview mode allows running all 4 Next.js applications (login, doceditor, management, sdk) as pre-built production bundles in a single orchestrated server, instead of running them in development mode via webpack-dev-server.

This significantly reduces startup time and memory usage during local development.

## How it works

The `deploy:preview` script builds each Next.js app in standalone mode (`output: "standalone"`) and merges their outputs into a single `publish/web/apps/` directory with shared `node_modules`.

At runtime, `server.js` starts each app as an isolated child process on its original port (login:5011, doceditor:5013, management:5015, sdk:5099) and acts as an HTTP reverse proxy on port 5055, routing requests by URL prefix.

The client SPA (webpack build) is deployed separately to `publish/web/client/` and served by nginx in Docker, or locally via `npx serve -s -p 5001`.

```
Browser -> nginx (8092) -> apps server (5055) -> child processes
                |                                  |-- login (5011)
                |                                  |-- doceditor (5013)
                |                                  |-- management (5015)
                |                                  +-- sdk (5099)
                +-> client static (5001)
```

## Quick start

### 1. Start the backend

```bash
cd server/common/ASC.AppHost
dotnet run --launch-profile frontend-dev
```

### 2. Build and deploy

```bash
cd client
pnpm deploy:preview
```

This will:
- Build all 4 Next.js apps with `output: "standalone"`
- Deploy the client (webpack) app
- Merge standalone outputs into `publish/web/apps/`
- Copy public assets and minify locales

### 3. Start the client static server

```bash
cd publish/web/client
npx serve -s -p 5001
```

### 4. Start the apps server

```bash
cd publish/web/apps
node server.js --app.port=5055 --app.hostname=127.0.0.1
```

The portal is available at http://localhost:8092.

### Docker preview

In Docker, nginx serves the client static files directly and proxies SSR requests to the apps server. No separate `npx serve` is needed.

## Architecture

### Files

| File | Description |
|------|-------------|
| `common/scripts/preview/deploy.js` | Build-time script that merges standalone outputs into `publish/web/apps/` |
| `common/scripts/preview/server.js` | Reverse proxy server — forks child processes and routes by URL prefix |
| `common/scripts/preview/server.prod.js` | Production entry point — sets env vars, parses CLI args, requires `server.combined.js` |
| `common/scripts/preview/app-worker.js` | Child process wrapper — reads Next.js config, patches `trustHostHeader`, starts the app |

### Deploy output

```
publish/web/
|-- apps/
|   |-- node_modules/              # Merged from all 4 standalone builds
|   |-- packages/
|   |   |-- login/.next/           # Login build output + static assets
|   |   |-- doceditor/.next/       # DocEditor build output + static assets
|   |   |-- management/.next/      # Management build output + static assets
|   |   |-- sdk/.next/             # SDK build output + static assets
|   |   +-- shared/                # Shared workspace dependency
|   |-- libs/
|   |   +-- ui-kit/                # UI kit workspace dependency
|   |-- server.js                  # Entry point (= server.prod.js)
|   |-- server.combined.js         # Proxy server (= server.js from source)
|   +-- app-worker.js              # Child process wrapper
+-- client/                        # Client SPA (webpack build)
```

### Why process-per-app

Next.js uses `globalThis` singletons (`Symbol.for('next.server.manifests')`, `Symbol.for('@next/router-server-methods')`) that get corrupted when multiple apps share a single Node.js process. Running each app in its own child process provides full isolation (separate `globalThis`, module cache, `AsyncLocalStorage`) while still sharing disk space through the merged deploy output.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5055` | Main proxy server port |
| `HOSTNAME` | `0.0.0.0` | Main proxy server bind address |
| `API_HOST` | `http://localhost:8092` | Backend API URL (passed to child processes for SSR) |
| `NODE_ENV` | `production` | Node environment |

## Comparison with other modes

| | `pnpm start` | `pnpm start:lite` | Preview mode |
|---|---|---|---|
| Apps | 5 (client + 4 SSR) | 3 (client + login + doceditor) | 5 (client + 4 SSR) |
| Build required | No (dev mode) | No (dev mode) | Yes (`pnpm deploy:preview`) |
| Startup time | Slow (webpack) | Medium | Fast (pre-built) |
| Hot reload | Yes | Yes | No (rebuild required) |
| SSR apps mode | Development | Development | Production |
| Client app mode | Development | Development | Production (static via nginx) |
