# PNID App Documentation

This directory contains comprehensive documentation for the PNID App project, covering development, deployment, and operational aspects across web and desktop platforms.

## Getting Started

- [Environment Setup Guide](./environment-setup.md) - Step-by-step instructions for setting up your development environment

## Web Development

- [Development Workflow Guide](./development-workflow.md) - Best practices and procedures for contributing to the project
- [Docker Workflow Guide](./docker-workflow.md) - Instructions for using Docker in different environments

## Desktop Application

- [Installation Guide](./installation-guide.md) - Simple instructions for installing pre-built releases
- [Electron Quick Start](./electron-quick-start.md) - Simplified setup and usage with helper scripts
- [Electron Setup Guide](./electron-setup.md) - Detailed instructions for setting up and developing the desktop application
- [Electron Testing Guide](./electron-testing.md) - Comprehensive testing procedures for the Electron integration
- [Electron Building Guide](./electron-build.md) - Detailed instructions for packaging and distributing the desktop app
- [Electron Security Guidelines](./electron-security.md) - Security best practices for the Electron implementation
- [Electron Troubleshooting](./electron-troubleshooting.md) - Solutions for common desktop app issues

## Deployment

- [Production Deployment Guide](./production-deployment.md) - Comprehensive guide for deploying to production
- [CI/CD Pipeline Guide](./ci-cd-guide.md) - Documentation for the continuous integration and deployment pipeline

## Architecture and Concepts

- [Multipage Support Redesign](./feature-guides/multipage-support-redesign.md) - Explanation of the multipage document functionality

## Reference

- [README.developer.md](../README.developer.md) - Developer overview and architectural information
- [CLAUDE.md](../CLAUDE.md) - Essential commands and coding guidelines

## Troubleshooting

- [Troubleshooting Guide](./troubleshooting.md) - Comprehensive solutions for common issues

Each guide aims to be thorough yet practical, providing both conceptual understanding and specific commands. If you encounter an issue not covered in the documentation, please check the GitHub issues or contribute by improving these guides.

## Documentation Structure

```
docs/
├── README.md                      # This file - Documentation overview
├── environment-setup.md           # Initial environment setup instructions
├── development-workflow.md        # Development practices and workflow
├── docker-workflow.md             # Docker configuration and usage
├── production-deployment.md       # Production deployment procedures
├── ci-cd-guide.md                 # CI/CD pipeline configuration
├── troubleshooting.md             # Common issues and solutions
├── installation-guide.md          # Installing pre-built desktop app releases
├── electron-quick-start.md        # Simplified desktop app setup with scripts
├── electron-setup.md              # Detailed desktop app setup and development
├── electron-testing.md            # Desktop app testing procedures
├── electron-build.md              # Desktop app packaging and distribution
├── electron-security.md           # Desktop app security guidelines
├── electron-troubleshooting.md    # Desktop app specific troubleshooting
└── feature-guides/                # In-depth guides for specific features
    └── multipage-support-redesign.md # Multipage document functionality
```

We also have maintenance scripts in the `/scripts` directory:

```
scripts/
├── README.md                      # Helper scripts documentation
├── setup-electron-env.sh          # Setup Electron development environment
├── start-electron-dev.sh          # Start all services and Electron dev mode
├── build-electron-app.sh          # Build Electron distributable packages
├── verify-docs.sh                 # Verify documentation accuracy
└── update-docs-versions.sh        # Update version references in docs
```

Each individual guide also includes a dedicated troubleshooting section for common issues. If you encounter problems not covered in these guides, please:

1. Check the main [Troubleshooting Guide](./troubleshooting.md) first
2. Review the relevant guide's troubleshooting section
3. Check logs for error messages
4. Create an issue on GitHub with detailed information about the problem

## Contributing to Documentation

If you find errors or want to improve these guides:

1. Fork the repository
2. Make your changes
3. Submit a pull request with a clear description of your improvements

Documentation is written in Markdown format for easy reading and maintenance.