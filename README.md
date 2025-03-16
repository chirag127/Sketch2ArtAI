# Sketch2ArtAI

A React Native application that converts sketches to artistic images using Google's Generative AI (Gemini).

## Deploying the App

### Android/iOS Deployment

1. Build for Android:

    ```
    cd frontend
    eas build -p android --profile preview
    ```

2. Build for iOS (requires Apple Developer account):
    ```
    cd frontend
    eas build -p ios --profile preview
    ```

### Web Deployment

1. Build the web version:

    ```
    npm run build
    ```

    This will create a web-build directory in the frontend folder.

2. Deploy to Netlify:

    ```
    # If using Netlify CLI
    netlify deploy --prod --dir frontend/web-build
    ```

    Alternatively, connect your GitHub repository to Netlify and it will automatically deploy using the netlify.toml configuration.

## Features

-   Take photos or select sketches from your gallery
-   Convert sketches to various art styles (Anime, Watercolor, Oil Painting, etc.)
-   Share converted art with friends

## Project Structure

```
Sketch2ArtAI/
├── backend/             # Express.js backend server
│   ├── server.js        # Main server file
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables
├── frontend/            # React Native & Expo frontend
│   ├── App.js           # Main app component
│   ├── screens/         # App screens
│   │   └── HomeScreen.js # Main screen for the app
│   ├── assets/          # Images and other static assets
│   └── package.json     # Frontend dependencies
└── README.md            # Project documentation
```

## Prerequisites

-   Node.js (v14 or later)
-   npm or yarn
-   Expo CLI
-   Google Gemini API key

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

    ```
    cd backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file in the backend directory with your Gemini API key:

    ```
    GEMINI_API_KEY=your_gemini_api_key_here
    PORT=3000
    ```

4. Start the backend server:
    ```
    npm start
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```
    cd frontend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Start the Expo development server:

    ```
    npm start
    ```

4. Use the Expo Go app on your mobile device to scan the QR code, or run on an emulator.

## Usage

1. Open the app on your device
2. Take a photo of your sketch or select one from your gallery
3. Choose an art style
4. Tap "Convert" to transform your sketch
5. Share your converted art with friends

## Technologies Used

-   React Native
-   Expo
-   Express.js
-   Google Generative AI (Gemini)
-   Axios
-   Expo Image Picker
-   Expo File System
-   Expo Sharing

## License

MIT

## Acknowledgements

-   Google Generative AI for providing the image generation capabilities
-   Expo team for the excellent React Native development tools
