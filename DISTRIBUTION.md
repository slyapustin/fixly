# Fixly Distribution Guide

This document contains information about distributing the Fixly Chrome Extension through GitHub Releases and the Chrome Web Store.

## GitHub Releases and Distribution

### Creating a GitHub Release

1. Update the version number in `src/manifest.json`
2. Run the build script to create a zip file:
   ```
   ./build.sh
   ```
3. Go to your GitHub repository and click on "Releases"
4. Click "Draft a new release"
5. Create a new tag matching your version (e.g., `v1.0.1`)
6. Add a title and description for your release
7. Upload the generated zip file (e.g., `fixly-v1.0.1.zip`)
8. Publish the release

### Installing from a GitHub Release

Users can install the extension from a GitHub release by:

1. Downloading the zip file from the release
2. Extracting the zip file to a folder on their computer
3. Opening Chrome and navigating to `chrome://extensions/`
4. Enabling "Developer mode" in the top right corner
5. Clicking "Load unpacked" and selecting the `src` folder from the extracted zip

### Chrome Web Store Distribution (Optional)

If you want to distribute through the Chrome Web Store:

1. Create a developer account on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. Package your extension:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Pack extension" and select your `src` folder
   - This will create a `.crx` file and a `.pem` file (keep the `.pem` file secure)
3. Upload the `.crx` file to the Chrome Web Store
4. Fill out the store listing details, screenshots, etc.
5. Submit for review

**Note:** Keep your `.pem` file secure and never commit it to version control. You'll need it for future updates to your extension on the Chrome Web Store.

## Automated Builds with GitHub Actions

This repository includes a GitHub Actions workflow that automatically builds and attaches the zip file to GitHub releases. When you create a new release on GitHub, the workflow will:

1. Extract the version number from `src/manifest.json`
2. Create a zip file of the `src` directory
3. Attach the zip file to the release

The workflow configuration is located in `.github/workflows/release.yml`. 