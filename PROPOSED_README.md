<p align="center">
  <a href="https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App">
    <img src="https://raw.githubusercontent.com/chirag127/chirag127/main/assets/cognisketch-banner.png" alt="CogniSketch Hero Banner"/>
  </a>
</p>

<h1 align="center">CogniSketch: AI Art Generator Mobile & Web App</h1>

<p align="center">
    <a href="https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/actions/workflows/ci.yml"><img alt="Build Status" src="https://img.shields.io/github/actions/workflow/status/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white"></a>
    <a href="https://codecov.io/gh/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App"><img alt="Code Coverage" src="https://img.shields.io/codecov/c/github/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=codecov&logoColor=white"></a>
    <a href="https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&color=blue"></a>
    <a href="https://github.com/biomejs/biome"><img alt="Linting & Formatting" src="https://img.shields.io/badge/linting-Biome-blueviolet?style=flat-square&logo=biome&logoColor=white"></a>
    <a href="https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=github&color=yellow"></a>
</p>

<p align="center">
  <img alt="Tech Stack" src="https://img.shields.io/badge/React%20Native-61DAFB?style=flat-square&logo=react&logoColor=black">
  <img alt="Tech Stack" src="https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white">
  <img alt="Tech Stack" src="https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white">
  <img alt="Tech Stack" src="https://img.shields.io/badge/Google%20Gemini-8E75B5?style=flat-square&logo=google-gemini&logoColor=white">
  <img alt="Tech Stack" src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white">
</p>


**CogniSketch** is a full-stack, cross-platform application that transforms your sketches and photos into stunning works of art. Powered by Google's Gemini Pro Vision, it offers a seamless mobile and web experience for generating images in diverse artistic styles like Anime, Watercolor, and Oil Painting.

This repository serves as a professional showcase of a modern, full-stack Generative AI application, demonstrating best practices in DevOps, architecture, and user experience.

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [✨ Key Features](#-key-features)
- [🤖 AI Agent Directives](#-ai-agent-directives)
- [🚀 Getting Started](#-getting-started)
- [▶️ Available Scripts](#️-available-scripts)
- [🏛️ Core Principles](#️-core-principles)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)

---

## 🏛️ Architecture

The application follows a classic Client-Server model, ensuring a clean separation of concerns between the user-facing mobile application and the backend processing engine.

mermaid
graph TD
    subgraph User Device
        A[Mobile/Web Client (React Native + Expo)]
    end

    subgraph Cloud Server
        B[Backend API (Node.js + Express)]
    end

    subgraph Google Cloud Platform
        C[Google Gemini Pro Vision API]
    end

    A -- HTTP Request (Image + Style Prompt) --> B;
    B -- API Call (Image Data + Instructions) --> C;
    C -- Generated Artistic Image --> B;
    B -- HTTP Response (Generated Image URL) --> A;


**Data Flow:**
1.  **Client:** The React Native app captures or uploads an image and sends it along with a selected art style to the backend.
2.  **Backend:** The Express.js server receives the request, validates it, and forwards the image data and a structured prompt to the Google Gemini API.
3.  **Gemini API:** The AI model processes the input and generates a new image based on the specified artistic style.
4.  **Response:** The backend receives the generated image, stores it temporarily if needed, and returns a URL to the client for display.

---

## ✨ Key Features

- **Cross-Platform:** Built with React Native and Expo for a single codebase that runs on iOS, Android, and the Web.
- **AI-Powered Art:** Leverages Google Gemini Pro Vision to generate high-quality, stylized images from user inputs.
- **Multiple Art Styles:** Supports a variety of styles, including Anime, Watercolor, Oil Painting, Sketch, and more.
- **Real-Time Generation:** Optimized backend processing for a fast and responsive user experience.
- **Modern Tech Stack:** Utilizes TypeScript for type safety, Biome for high-performance linting and formatting, and a robust CI/CD pipeline.
- **Secure API:** Backend routes are secured and designed to handle image data efficiently.

---

## 🤖 AI Agent Directives

<details>
<summary><strong>Expand for AI Development & Maintenance Guidelines (Apex Technical Authority)</strong></summary>

### SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

#### 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards.
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

#### 2. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
This repository, `CogniSketch-AI-Art-Generator-Mobile-Web-App`, is a full-stack AI application.

*   **PRIMARY SCENARIO: WEB / APP / GUI (TypeScript Full-Stack)**
    *   **Stack:** This project is a monorepo containing a **React Native (Expo)** client and a **Node.js (Express)** backend, both using **TypeScript 6.x (Strict)**. **Biome** is the mandated tool for all linting, formatting, and import sorting.
    *   **Architecture:** Follows a strict **Client-Server Architecture**. 
        *   The **Client** (`/client`) is responsible for UI/UX and state management, communicating with the backend via a type-safe REST API contract (consider using tRPC or OpenAPI for generation).
        *   The **Server** (`/server`) handles all business logic, authentication, and communication with the external **Google Gemini Pro Vision API**. It must never expose raw API keys to the client.
    *   **State Management (Client):** Use React Context for simple state or Zustand for more complex global state. Avoid Redux unless absolutely necessary.
    *   **API Design (Server):** Adhere to RESTful principles. All endpoints must have robust validation (e.g., using Zod) and centralized error handling middleware.
    *   **AI Integration:** The service layer on the backend must contain a dedicated module for interacting with the Gemini API. This module will abstract away the API calls, handle prompt engineering, and manage error states from the AI model.

#### 3. VERIFICATION & DEPLOYMENT COMMANDS
*   **Verify Linting & Formatting (Root):** `npm run lint`
*   **Run Unit & Integration Tests (Client/Server):** `npm test`
*   **Build for Production (Client):** `npx expo prebuild` and `npx expo run:[android|ios]`
*   **Build for Production (Server):** `npm run build`
*   **CI/CD Pipeline:** The `.github/workflows/ci.yml` pipeline is the single source of truth for build, test, and lint validation. All pull requests must pass these checks.

</details>

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing purposes.

### Prerequisites

- Node.js (v18 or later)
- npm or Yarn
- Expo Go app on your mobile device or an Android/iOS emulator.
- A Google Gemini API Key.

### Installation & Setup

1.  **Clone the Repository:**
    bash
    git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App.git
    cd CogniSketch-AI-Art-Generator-Mobile-Web-App
    

2.  **Setup the Backend API:**
    bash
    cd server
    npm install
    
    - Create a `.env` file in the `/server` directory and add your Google Gemini API key:
      env
      GEMINI_API_KEY="YOUR_API_KEY_HERE"
      PORT=8000
      

3.  **Setup the Frontend Client:**
    bash
    cd ../client
    npm install
    
    - Create a `.env` file in the `/client` directory and point it to your local backend:
      env
      EXPO_PUBLIC_API_URL="http://localhost:8000"
      

### Running the Application

1.  **Start the Backend Server:**
    - Open a terminal in the `/server` directory.
    bash
    npm run dev
    

2.  **Start the Frontend Client:**
    - Open a second terminal in the `/client` directory.
    bash
    npm start
    
    - Scan the QR code with the Expo Go app on your mobile device.

---

## ▶️ Available Scripts

This project is a monorepo. Run commands from their respective `/client` or `/server` directories.

| Command         | Description                                        |
| --------------- | -------------------------------------------------- |
| `npm start`     | Starts the development server (client or server).  |
| `npm run dev`   | Starts the server in development mode with nodemon.|
| `npm test`      | Runs the test suite using Vitest or Jest.          |
| `npm run lint`  | Lints and formats all files using Biome.           |
| `npm run build` | (Server only) Compiles TypeScript to JavaScript.   |

---

## 🏛️ Core Principles

- **SOLID:** Code is structured to be scalable and maintainable, following Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles.
- **DRY (Don't Repeat Yourself):** Reusable logic is abstracted into services, hooks, and utility functions to maintain a lean codebase.
- **YAGNI (You Ain't Gonna Need It):** Features are implemented to meet current requirements, avoiding premature optimization and feature bloat.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please see [`.github/CONTRIBUTING.md`](./.github/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [`LICENSE`](./LICENSE) file for more details.
