#!/bin/bash

# Build script for Sketch2ArtAI

echo "Starting build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build the web version
echo "Building web version..."
npx expo export:web

echo "Build completed successfully!"
echo "Output is in frontend/web-build directory"
