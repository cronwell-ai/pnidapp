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
This application is available in two formats:

* **Online Version:** Access the app directly at [beta.pnid.app](beta.pnid.app). This version is hosted and maintained by our team and is meant for users who want to try it out immediately.
* **Self-Hosted Version:** For users who require more control over their data or need to integrate the app into their own infrastructure, we offer a self-hosted option. Follow the self-hosting guide in the next section to set up your own instance of the application.

Choose the option that best suits your needs and security requirements.

## Self-Hosting / Local Development

This project utilizes Supabase and Next.js, along with a Flask server for PDF export and an Express server for AI-assisted metadata parsing. For local development, we use the Supabase CLI to initialize a Supabase instance and Docker Compose to orchestrate the Next.js, PDF export, and metadata parser servers.

#### Prerequisites

- Supabase CLI
- Docker and Docker Compose
- Node.js and npm
- OpenAI API key (for metadata parsing)

#### Step 1: Initialize Local Supabase Instance

1. Start the Supabase instance:
   ```
   supabase start
   ```
2. Note the `API URL`, `anon key`, and `service_role key` provided upon completion.
3. Populate the database schema, storage buckets, and RLS policies:
   ```
   ./supabase/seed.sh
   ```

#### Step 2: Configure Next.js Environment Variables

1. Determine the external IP address of your host machine:
   - On Linux/macOS: `ifconfig` or `ip a`
   - On Windows: `ipconfig`
2. Rename `.env.example` to `.env.local`.
3. Update `.env.local` with the following:
   - Set `NEXT_PUBLIC_EXTERNAL_API` to your external IP address.
   - Set `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the `anon key` from Step 1.
   - Set `SUPABASE_SERVICE_KEY` to the `service_role key` from Step 1.
   - Optionally, customize other variables as needed.

#### Step 3: Configure Metadata Parser Environment Variables

Update the `docker-compose.yml` file with the following:

1. Set `SUPABASE_URL` to `http://{NEXT_PUBLIC_EXTERNAL_IP}:54321`.
2. Set `SUPABASE_SERVICE_KEY` to the `service_role key` from Step 1.
3. Set `OPENAI_API_KEY` to your OpenAI API key.

#### Step 4: Launch the Application

1. Build and start the Docker containers:
   ```
   docker compose up --build
   ```
2. Access the application at `http://{YOUR_PUBLIC_EXTERNAL_IP}:3000`.


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