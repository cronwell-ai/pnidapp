# PNID App

[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/yourusername/pnid-app.svg)](https://github.com/cronwell-ai/pnid-app/stargazers)

PNID.app is a powerful tool for labeling and managing Process and Instrumentation Diagrams (P&IDs), designed to streamline the reading and analysis process for engineers and technicians in the process industry.

![PNID App Screenshot](https://i.ibb.co/S07bvPv/labels-dark.png)

## Core Features

- **Project Management**: Create and organize projects using images or PDF files of P&IDs.
- **Intuitive Labeling**: Easily label P&IDs with different categories of components.
- **Metadata Management**: Add and edit metadata for labeled components.
- **Public Sharing**: Generate public views for each labeled P&ID.
- **AI-Assisted Predictions**: Utilize machine learning for automated metadata suggestions.
- **Export Functionality**: Export labeled P&IDs to PDF format.

## Usage
This application is available in three formats:

* **Online Version:** Access the app directly at [beta.pnid.app](beta.pnid.app). This version is hosted and maintained by our team and is meant for users who want to try it out immediately.
* **Desktop Application:** Native application with offline capabilities and improved file handling.
  * **Coming Soon:** Desktop applications for macOS, Windows, and Linux
  * Check our [Releases page](https://github.com/cronwell-ai/pnidapp/releases) for available downloads
  * See [Installation Guide](./docs/installation-guide.md) for installation instructions
  * See [Electron Quick Start](./docs/electron-quick-start.md) for building from source
* **Self-Hosted Version:** For users who require more control over their data or need to integrate the app into their own infrastructure, we offer a self-hosted option. Follow the self-hosting guide in the next section to set up your own instance of the application.

Choose the option that best suits your needs and security requirements.

## Self-Hosting / Local Development

This project utilizes Supabase and Next.js, along with a Flask server for PDF export and an Express server for AI-assisted metadata parsing. For local development, we use the Supabase CLI to initialize a Supabase instance and can run each service individually or orchestrate them with Docker Compose.

> **For detailed instructions**, please refer to our comprehensive documentation in the [docs directory](./docs/README.md) which contains setup guides, development workflows, Docker instructions, and deployment procedures.

#### Prerequisites

- Supabase CLI
- Docker and Docker Compose (optional)
- Node.js and pnpm
- Python 3.11+ with pip 
- OpenAI API key (for metadata parsing)
- Resend API key (can use dummy for local development)

#### Quick Start Guide

1. **Start Supabase and initialize schema:**
   ```bash
   supabase start
   ./supabase/seed.sh
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env.local`
   - Set your machine's IP address, Supabase keys, and API keys

3. **Run the services (using individual processes):**
   ```bash
   # Terminal 1: Next.js app
   pnpm install # First time only to ensure Next.js is installed
   pnpm dev
   
   # Terminal 2: Metadata parser
   cd companion/metadata-parser && PORT=7123 pnpm dev
   
   # Terminal 3: PDF export service (with Python virtual environment)
   cd companion/pdf-export
   python3 -m venv venv  # First time only
   source venv/bin/activate
   pip install -r requirements.txt  # First time only
   python main.py  # Will use port 6123 by default
   ```

4. **Alternative: Run with Docker Compose:**
   ```bash
   # Standard configuration
   docker compose up --build
   
   # Development with hot reloading
   docker compose -f docker-compose.dev.yml up
   ```

   **Note for macOS users**: If you encounter port conflicts with port 5000 (used by AirPlay Receiver), either disable AirPlay Receiver in System Settings or use the individual process method above with explicit port settings.

5. **Access the application:**
   Open `http://{YOUR_IP_ADDRESS}:3000` in your browser

#### Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| NEXT_PUBLIC_EXTERNAL_IP | Your machine's IP address | 192.168.1.147 |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anonymous key | eyJhbGci... |
| SUPABASE_SERVICE_KEY | Supabase service role key | eyJhbGci... |
| OPENAI_API_KEY | OpenAI API key for metadata parsing | sk-... |
| RESEND_API_KEY | Resend API key for emails | re_... |

#### Documentation

For comprehensive instructions, refer to our documentation:

- [Environment Setup Guide](./docs/environment-setup.md) - Detailed setup instructions
- [Development Workflow Guide](./docs/development-workflow.md) - Development best practices
- [Docker Workflow Guide](./docs/docker-workflow.md) - Docker usage in different environments
- [Production Deployment Guide](./docs/production-deployment.md) - Deployment instructions
- [CI/CD Pipeline Guide](./docs/ci-cd-guide.md) - Automated deployment workflow

#### Desktop Application Development

For building and testing the macOS desktop application:

- [Electron Setup Guide](./docs/electron-setup.md) - Desktop app setup instructions
- [Electron Testing Guide](./docs/electron-testing.md) - Test procedures for the desktop app
- [Electron Building Guide](./docs/electron-build.md) - Desktop app packaging and distribution
- [Electron Security Guidelines](./docs/electron-security.md) - Security best practices


## Roadmap

We have exciting plans for the future of PNID App. Here's a glimpse of what's coming:

- [ ] Editor: customize component type
- [ ] Editor: improved pipe labeling
- [ ] Editor: example-based metadata parsing
- [ ] Viewer: comments and markups from collaboration
- [ ] Export: integration with popular CAD software and workflow
- [ ] Project: multi-page documents
- [ ] Search functionality

We're always open to suggestions! If you have ideas for new features or improvements, please open an issue with the title "Feature Proposal", or send an email to support@pnid.app!

## Contributing

We welcome contributions to the PNID App! Please fork our repository, clone and make your updates, and submit a pull request! Please make sure to use meaningful commit messages and a meaningful title for your pull request.

## License

This project is licensed under the GNU Affero General Public License v3.0 (AGPLv3) - see the [LICENSE](LICENSE.txt) file for details. This license ensures that if you modify the software and provide it as a service over a network, you must make the modified source code available to users of that service.