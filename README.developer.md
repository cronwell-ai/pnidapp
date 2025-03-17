# PNID App Developer Guide

This guide provides detailed information for developers working on the PNID.app codebase. It covers local development setup, architecture overview, and troubleshooting tips for both web and desktop applications.

## Architecture Overview

PNID.app consists of four main components:

1. **Next.js Frontend/Backend** (port 3000): The main application that handles UI, authentication, and data management.
2. **Metadata Parser Service** (port 7123): An Express.js service for AI-assisted metadata extraction using OpenAI.
3. **PDF Export Service** (port 6123): A Flask service for generating PDF exports of labeled P&IDs.
4. **Electron Desktop Application**: An optional wrapper that packages the web application and companion services into a native desktop experience.

All these components connect to a Supabase backend that provides database, authentication, and storage services.

## Detailed Setup Instructions

### Prerequisites
- Node.js and pnpm
- Python 3.11+ with pip
- Docker (optional, for containerized deployment)
- Supabase CLI
- OpenAI API key

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone <your-fork-url>
   cd pnidapp
   ```

2. **Install Dependencies**
   ```bash
   # Install main app dependencies
   pnpm install
   
   # Install metadata parser dependencies
   cd companion/metadata-parser && pnpm install
   
   # Install PDF export dependencies
   cd companion/pdf-export && pip install -r requirements.txt
   ```

3. **Set Up Supabase**
   ```bash
   # Start Supabase
   supabase start
   
   # Initialize database schema and policies
   ./supabase/seed.sh
   ```

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local` and update the following:
     - Set `NEXT_PUBLIC_EXTERNAL_IP` to your machine's local IP
     - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY` from Supabase output
     - Add your `OPENAI_API_KEY`
     - Add a `RESEND_API_KEY` (can be a dummy value for local development)

   - Create `.env` in the metadata-parser directory with:
     ```
     USE_HTTPS=false
     PORT=5000
     SUPABASE_URL=http://<your-ip>:54321
     SUPABASE_SERVICE_KEY=<service-role-key>
     OPENAI_API_KEY=<your-openai-key>
     ```

5. **Run the Services**
   In separate terminal windows:

   ```bash
   # Terminal 1: Run the Next.js app
   pnpm dev
   
   # Terminal 2: Run the metadata parser
   cd companion/metadata-parser && pnpm dev
   
   # Terminal 3: Run the PDF export service
   cd companion/pdf-export && python main.py
   ```

6. **Access the Application**
   Open your browser and navigate to `http://<your-ip>:3000`

## Troubleshooting

### OpenAI API Key Issues
If you encounter "Missing OpenAI API key" errors:
- Ensure the key is correctly set in both `.env.local` and `companion/metadata-parser/.env`
- Check if the key is valid and has sufficient quota
- The app will work without OpenAI functionality, but metadata parsing will be disabled

### Supabase Connection Issues
If you have problems connecting to Supabase:
- Ensure Supabase is running with `supabase status`
- Verify connection details in environment files
- Run `./supabase/seed.sh` to reset and initialize the database

### Docker Build Failures
If Docker builds fail:
- Ensure Docker Desktop is running
- Check network connectivity for package downloads
- Try running individual services directly without Docker

### Environment Variables and Secrets
For better security:
- Use `.env.local` for development (never commit this file)
- Create `.env.example` files showing required variables without actual values
- In production, use `.env.production` (also never committed)
- For CI/CD, use GitHub Secrets for all sensitive values
- Health checks may fail if services can't connect to required resources

## Development Workflow

1. **Making Changes**
   - Frontend changes: Modify files in `src/` directory
   - Metadata parser changes: Edit files in `companion/metadata-parser/src/`
   - PDF export changes: Edit files in `companion/pdf-export/`

2. **Testing Changes**
   - Test frontend changes at `http://<your-ip>:3000`
   - Test metadata parser at `http://<your-ip>:7123`
   - Test PDF export at `http://<your-ip>:6123`

3. **Code Quality**
   - Run `pnpm lint` to check for code style issues
   - Address any TypeScript errors before committing

4. **Docker Development Workflow**
   - Run with development volumes for hot reloading:
   ```bash
   docker compose -f docker-compose.dev.yml up
   ```
   
   - Run production build locally:
   ```bash
   docker compose up
   ```
   
   - Run production configuration:
   ```bash
   docker compose -f docker-compose.prod.yml up
   ```

5. **CI/CD Pipeline**
   - Pushing to main triggers automatic deployment
   - Pull requests run tests but don't deploy
   - GitHub Actions pipeline handles:
     - Testing
     - Building Docker images
     - Pushing to Docker Hub
     - Deploying to production server

## Electron Desktop Application

The Electron application provides a native desktop experience by wrapping the Next.js application along with its companion services.

### Electron Architecture

- **Main Process** (`electron/main.js`): Handles application lifecycle, OS integration, and companion service management
- **Renderer Process**: The Next.js application running within an Electron BrowserWindow
- **Preload Script** (`electron/preload.js`): Secure bridge between main and renderer processes
- **IPC Communication**: Allows secure communication between the main and renderer processes

### Electron Development

1. **Setup for Electron Development**
   ```bash
   # Install dependencies
   cd electron
   pnpm install
   ```

2. **Running Electron in Development Mode**
   ```bash
   # First ensure all services are running:
   # - Next.js on port 3000
   # - Metadata parser on port 7123
   # - PDF export on port 6123
   
   # Then start Electron
   cd electron
   pnpm dev
   ```

3. **Building Electron Application**
   ```bash
   # Build Next.js first
   pnpm build
   
   # Then build Electron
   cd electron
   pnpm build
   ```

4. **Creating Distribution Packages**
   ```bash
   cd electron
   
   # For macOS
   pnpm pack:mac
   
   # For Windows
   pnpm pack:win
   
   # For Linux
   pnpm pack:linux
   ```

### Electron Development Guidelines

- All Electron-specific code should be isolated in the `/src/lib/electron` directory
- Use the `useElectron()` hook to safely access Electron features
- Always provide web fallbacks for Electron-specific functionality
- Follow security best practices detailed in the [Electron Security Guidelines](./docs/electron-security.md)

For detailed documentation on the Electron implementation, refer to:
- [Electron Setup Guide](./docs/electron-setup.md)
- [Electron Testing Guide](./docs/electron-testing.md)
- [Electron Building Guide](./docs/electron-build.md)
- [Electron Troubleshooting](./docs/electron-troubleshooting.md)

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.io/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [PyMuPDF Documentation](https://pymupdf.readthedocs.io/)
- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Electron Builder Documentation](https://www.electron.build/)