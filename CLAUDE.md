# CLAUDE.md - Essential Commands and Guidelines

## Project Commands

### Core Development
- **Supabase Local**: 
  - `supabase start` - Start local Supabase instance
  - `supabase stop` - Stop local Supabase instance
  - `./supabase/seed.sh` - Initialize database schema and policies

- **Next.js Development**:
  - Install dependencies: `pnpm install` 
  - Start dev server: `pnpm dev` - Runs on port 3000
  - Build for production: `pnpm build`
  - Start production server: `pnpm start`
  - Lint code: `pnpm lint`

- **Companion Services**:
  - Metadata parser: 
    ```bash
    cd companion/metadata-parser
    pnpm install  # First time only
    PORT=7123 pnpm dev
    ```
  - PDF Export:
    ```bash
    cd companion/pdf-export
    python3 -m venv venv  # Create virtual environment (first time only)
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    pip install -r requirements.txt  # First time only
    python main.py  # Will run on port 6123 by default
    ```

### Electron Desktop App
- **Quick Setup & Development**:
  ```bash
  # Setup all dependencies (first time only)
  ./scripts/setup-electron-env.sh
  
  # Start development environment with all services
  ./scripts/start-electron-dev.sh
  ```

- **Building**:
  ```bash
  # Build for macOS, Windows, or Linux
  ./scripts/build-electron-app.sh
  ```

- **Manual Development** (if you prefer):
  ```bash
  # With Next.js already running on port 3000 and companion services running:
  cd electron
  pnpm install  # First time only
  pnpm dev  # Start Electron in development mode
  ```

- **Manual Building** (if you prefer):
  ```bash
  # Build Next.js first
  pnpm build
  
  # Then build Electron app
  cd electron
  pnpm build  # Creates distributables in electron/dist
  
  # Platform-specific builds
  pnpm pack:mac  # macOS .dmg
  pnpm pack:win  # Windows .exe
  pnpm pack:linux  # Linux .AppImage
  ```

### Docker Development
- With hot reloading: `docker compose -f docker-compose.dev.yml up`
- Standard configuration: `docker compose up`
- Production-like environment: `docker compose -f docker-compose.prod.yml up`
- Stop containers: `docker compose down`
- View logs: `docker compose logs`
- View service logs: `docker compose logs pnid-app`
- Access container shell: `docker compose exec pnid-app sh`
- Check container status: `docker compose ps`
- Rebuild containers: `docker compose up --build`

## Environment Configuration

### Required API Keys
- **OpenAI API key** - For metadata parsing functionality (`OPENAI_API_KEY`)
- **Resend API key** - For email functionality (`RESEND_API_KEY`)
- **Supabase credentials**:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_KEY`

### .env.local Setup
```
# Required Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# OpenAI API key for metadata parsing
OPENAI_API_KEY=your_openai_api_key

# For email functionality (can be dummy value for local dev)
RESEND_API_KEY=your_resend_api_key

# For local development with companion services
NEXT_PUBLIC_EXTERNAL_IP=your_machine_ip_or_localhost
```

## Electron Development Tips

### Service Communication
- Electron app embeds companion services (metadata parser and PDF export)
- Services run on localhost ports:
  - Next.js: port 3000
  - Metadata parser: port 7123
  - PDF export: port 6123

### File Handling
- Use `useElectron()` hook to access desktop-specific features
- Example file handling:
  ```typescript
  import { useElectron } from '@/lib/electron';
  
  // In your component:
  const { isElectronApp, openFileDialog } = useElectron();
  
  const openFile = async () => {
    if (isElectronApp) {
      const result = await openFileDialog({
        filters: [
          { name: 'P&ID Files', extensions: ['pdf', 'jpg', 'png'] }
        ]
      });
      // Handle selected file
    }
  };
  ```

### macOS Specific Features
- Native menus are available in main.js
- Use macOS notifications:
  ```javascript
  // In preload.js, expose:
  showNotification: (title, body) => {
    new Notification({ title, body }).show();
  }
  
  // In renderer:
  window.electron.showNotification('File Processed', 'Your P&ID has been processed');
  ```

### Web Compatibility
- Always check environment before using Electron features:
  ```typescript
  if (isElectronApp) {
    // Electron-specific code
  } else {
    // Web fallback
  }
  ```

## Coding Style Guidelines
- **TypeScript**: Use strict mode with explicit type annotations
- **Imports**: Group imports by source (React, components, utils, types)
- **Naming**: PascalCase for components/types, camelCase for variables/functions
- **Components**: Use functional components with React hooks
- **Error Handling**: Use try/catch with proper error logging
- **State Management**: Use React Query for async state, React context where appropriate
- **Formatting**: 2-space indentation, no trailing commas
- **File Structure**: Group related functionality in directories
- **CSS**: Use Tailwind utility classes with shadcn/ui component system
- **Electron**: Keep Electron-specific code isolated in /src/lib/electron directory

## Tech Stack
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Microservices**: Express.js (metadata parser), Flask (PDF export)
- **Desktop**: Electron (macOS, Windows, Linux)
- **API Integration**: OpenAI for metadata parsing
- **State Management**: React Query, Zustand
- **UI Components**: Radix UI primitives via shadcn/ui
- **Deployment**: Docker, Docker Compose, GitHub Actions, Electron Builder
- **CI/CD**: GitHub Actions workflow for automated deployment

## Documentation References
- [Environment Setup Guide](./docs/environment-setup.md)
- [Development Workflow Guide](./docs/development-workflow.md)
- [Docker Workflow Guide](./docs/docker-workflow.md)
- [Production Deployment Guide](./docs/production-deployment.md)
- [CI/CD Pipeline Guide](./docs/ci-cd-guide.md)
- [Electron Setup Guide](./docs/electron-setup.md)
- [Electron Testing Guide](./docs/electron-testing.md)
- [Electron Building Guide](./docs/electron-build.md)
- [Electron Security Guidelines](./docs/electron-security.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

## Common Troubleshooting

### Next.js Development Issues
- **"Cannot find module"**: Run `pnpm install` to ensure all dependencies are installed
- **Port conflicts**: Check if another service is using port 3000, adjust with `PORT=3001 pnpm dev`

### Supabase Issues
- **Connection errors**: Ensure Supabase is running with `supabase status`
- **Auth problems**: Check that environment variables match your local Supabase instance

### Companion Services Issues
- **Metadata parser not responding**: Check it's running on port 7123
- **PDF export failures**: Check Python environment and ensure service is running on port 6123

### Electron Issues
- **Development errors**: Ensure Next.js and companion services are running before starting Electron
- **Build failures**: Check electron/package.json for correct configuration
- **White screen**: Check main.js for proper window loading and DevTools for errors
- **IPC errors**: Verify preload.js is properly exposing and validating IPC methods