#!/bin/bash

# Netlify build script for Sketch2ArtAI

echo "Starting Netlify build process..."

# Print environment information
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Copy the Netlify-specific package.json to the root if it exists
if [ -f "package-netlify.json" ]; then
  echo "Using Netlify-specific package.json"
  cp package-netlify.json package.json
fi

# Navigate to frontend directory
echo "Changing to frontend directory..."
cd frontend
echo "Now in: $(pwd)"
echo "Frontend directory contents:"
ls -la

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build the web version
echo "Building web version..."
npx expo export:web

# Check if the build was successful
if [ -d "web-build" ]; then
  echo "Build completed successfully!"
  echo "web-build directory contents:"
  ls -la web-build
else
  echo "Build failed: web-build directory not found"
  exit 1
fi
