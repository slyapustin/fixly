#!/bin/bash

# Fixly Extension Build Script
# This script creates a zip file of the src directory for GitHub releases

# Get version from manifest.json
VERSION=$(grep -o '"version": "[^"]*"' src/manifest.json | cut -d'"' -f4)

# Create zip file
echo "Creating zip file for Fixly v$VERSION..."
zip -r fixly-v$VERSION.zip src -x "*.DS_Store" "*.git*"

echo "✅ Build complete: fixly-v$VERSION.zip"
echo "You can now upload this file to your GitHub release." 