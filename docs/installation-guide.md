# P&ID App Installation Guide

This guide provides step-by-step instructions for installing the P&ID App desktop application on different operating systems.

> **Note:** Desktop application downloads are coming soon! This guide will be applicable once releases are available on our [GitHub Releases page](https://github.com/cronwell-ai/pnidapp/releases).

## macOS Installation

1. **Download the App**
   * Go to our [Releases page](https://github.com/cronwell-ai/pnidapp/releases) and download the latest `.dmg` file
   * The `.dmg` file will be downloaded to your computer

2. **Install the App**
   * Open the downloaded `.dmg` file
   * Drag the P&ID App icon to the Applications folder
   * Close the installer window

3. **First Launch**
   * Open your Applications folder
   * Right-click (or Control+click) on the P&ID App and select "Open"
   * Click "Open" in the security dialog that appears
   * The app will start automatically

> **Note:** The right-click method is only needed the first time you open the app. After that, you can open it normally.

## Windows Installation

1. **Download the App**
   * Go to our [Releases page](https://github.com/cronwell-ai/pnidapp/releases) and download the latest `.exe` installer
   * The installer `.exe` file will be downloaded to your computer

2. **Install the App**
   * Run the downloaded `.exe` file
   * If you see a security warning, click "More info" and then "Run anyway"
   * Follow the installation wizard prompts
   * Click "Finish" to complete the installation

3. **Launch the App**
   * The app can be launched from:
     * The desktop shortcut
     * The Start menu
     * The taskbar (if you've pinned it)

## Linux Installation

1. **Download the App**
   * Go to our [Releases page](https://github.com/cronwell-ai/pnidapp/releases) and download the latest `.AppImage` file
   * The `.AppImage` file will be downloaded to your computer

2. **Make the AppImage Executable**
   * Open a terminal
   * Navigate to the download directory:
     ```bash
     cd ~/Downloads
     ```
   * Make the AppImage executable:
     ```bash
     chmod +x PNID-App.AppImage
     ```

3. **Launch the App**
   * Double-click the AppImage file in your file manager
   * Or run it from the terminal:
     ```bash
     ./PNID-App.AppImage
     ```

## Troubleshooting

### macOS

* **"App is damaged" message**
  * This is due to macOS's security features.
  * Open System Preferences > Security & Privacy > General
  * Look for a message about P&ID App being blocked
  * Click "Open Anyway"

* **"App is from an unidentified developer" message**
  * Right-click (or Control+click) the app in Applications
  * Select "Open" from the menu
  * Click "Open" in the dialog

### Windows

* **SmartScreen warning**
  * Click "More info" then "Run anyway"

* **Missing DLL errors**
  * Install the latest Microsoft Visual C++ Redistributable package

### Linux

* **"Cannot execute" error**
  * Make sure the AppImage is executable:
    ```bash
    chmod +x PNID-App.AppImage
    ```

* **Missing libraries error**
  * Install the required dependencies:
    ```bash
    sudo apt-get install libfuse2
    ```
    (Command may differ based on your distribution)

## System Requirements

* **macOS**: 10.15 (Catalina) or later
* **Windows**: Windows 10 or later (64-bit)
* **Linux**: Any modern distribution with FUSE 2 support

## Getting Started

After installation, you'll need to:

1. Create an account or log in with existing credentials
2. Begin creating or importing P&ID documents
3. Start labeling your diagrams

For detailed usage instructions, refer to the in-app help or [online documentation](https://beta.pnid.app/docs).