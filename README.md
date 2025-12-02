# CogniSketch-AI-Art-Generator-Mobile-Web-App

[![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/ci.yml?style=flat-square&logo=githubactions)](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=codecov)](https://codecov.io/gh/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App)
[![Tech Stack](https://img.shields.io/badge/TechStack-React%20Native%2C%20Express%2C%20Gemini-blue?style=flat-square&logo=react)](https://reactnative.dev/)
[![Lint/Format](https://img.shields.io/badge/Linter-Biome-FF9A00?style=flat-square&logo=biome)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-orange?style=flat-square&logo=creativecommons)](https://creativecommons.org/licenses/by-nc/4.0/)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=github)](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App)


--- 

### ⭐ Star this Repo ⭐

--- 

**CogniSketch** is a cutting-edge, cross-platform generative AI application that transforms user-created sketches and existing photos into stunning digital art across various styles. Built with React Native for mobile and Express.js for the backend, it harnesses the power of Google Gemini Pro Vision to deliver a seamless, creative experience.

--- 

## Table of Contents

*   [Project Overview](#project-overview)
*   [Key Features](#key-features)
*   [Architecture](#architecture)
*   [AI Agent Directives](#ai-agent-directives)
*   [Development Setup](#development-setup)
*   [Project Structure](#project-structure)
*   [Contributing](#contributing)
*   [License](#license)

--- 

## Project Overview

**CogniSketch** bridges the gap between simple user input and complex AI-generated art. It allows users to upload sketches or photos and select from a diverse palette of artistic styles—including Anime, Watercolor, Oil Paint, and more—to reimagine their visuals. The application is designed as a full-stack showcase for generative AI capabilities, offering a robust and scalable solution for both mobile and web platforms.

--- 

## Key Features

*   **Cross-Platform Compatibility:** Runs on iOS, Android, and Web via React Native and Expo.
*   **AI-Powered Style Transfer:** Transforms input into various artistic styles using Google Gemini Pro Vision.
*   **Intuitive Sketching Interface:** User-friendly tools for creating original sketches.
*   **Photo Integration:** Leverage existing images as input for art generation.
*   **Express.js Backend:** Robust API for handling requests and AI interactions.
*   **Modern Tech Stack:** TypeScript, Vite, TailwindCSS, Biome, Playwright.
*   **DevOps Enabled:** Integrated CI/CD pipelines for seamless development and deployment.

--- 

## Architecture

ascii
+-----------------------+        +-----------------------+        +-------------------------+
|                       |        |                       |        |                         |
|   User Interface      |        |   Backend API (Node.js)|        |   Google Gemini Pro     |
| (React Native/Expo)   | <----->|   (Express.js)        | <----->|   Vision API            |
|                       |        |                       |        |                         |
+-----------------------+        +-----------+-----------+        +-------------------------+
          |                                      |
          | Sketch/Image Input                   | Art Generation Request
          +-------------------------------------->


--- 

## 🤖 AI Agent Directives

<details>
<summary>Click to expand AI Agent Directives</summary>

This repository is managed by the Apex Technical Authority and adheres to the following AI Agent Directives. These are designed to ensure code quality, architectural integrity, and operational excellence.

### 1. Identity & Prime Directive
- **Role:** Senior Principal Software Architect & Master Technical Copywriter (40+ years elite experience).
- **Context:** Current Date is December 2025. Building for the 2026 standard.
- **Output Standard:** EXECUTION-ONLY. No plans, only executed code, updated docs, and applied fixes.
- **Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

### 2. Input Processing & Cognition
- **Speech-to-Text Interpretation Protocol:** Perform semantic correction for phonetic errors and typos. Infer technical intent based on project context.
- **Logic Anchor:** `README.md` is the Single Source of Truth (SSOT).
- **Mandatory MCP Instrumentation:** 
    - **No Guessing:** Do not hallucinate APIs. 
    - **Research First:** Use `linkup`/`brave` for Dec 2025 Industry Standards, Security Threats, and 2026 UI Trends.
    - **Validation:** Use `docfork` to verify external API signatures.
    - **Reasoning:** Engage `clear-thought-two` for complex flow architecture *before* writing code.

### 3. Context-Aware Apex Tech Stacks (Late 2025 Standards)
- **Primary Scenario:** WEB / APP / EXTENSION (TypeScript)
    - **Stack:** TypeScript 6.x (Strict), Vite 7 (Rolldown), Tauri v2.x (Native), WXT (Extensions).
    - **State Management:** Signals (Standardized).
    - **UI Framework:** Preact/React 19+ with latest Hooks and Suspense.
    - **Styling:** TailwindCSS v4.
    - **Linting/Formatting:** Biome.
    - **Testing:** Vitest (Unit), Playwright (E2E).
    - **Architecture:** Feature-Sliced Design (FSD).
- **Secondary Scenario:** SYSTEMS / PERFORMANCE (Rust/Go) - *Not applicable for this project.* 
- **Tertiary Scenario:** DATA / SCRIPTS / AI (Python) - *Not applicable for this project.* 

### 4. Apex Naming Convention (Star Velocity Engine)
- **Formula:** `<Product-Name>-<Primary-Function>-<Platform>-<Type>`
- **Format:** `Title-Case-With-Hyphens`
- **Rules:** 3-10 words, include high-volume keywords, no numbers/emojis/underscores/generic words without qualifiers.

### 5. Repository Integrity & Purpose Pivot Protocol
- **Identity Preservation:** Respect existing project type if viable.
- **Purpose Pivot:** If current purpose is weak, re-imagine the codebase as a professional tool.
- **Professional Archival (Retired Product Standard):** Elevate metadata (Name, Description, Topics) for archived repos.

### 6. Compliance Mandate (The "Standard 11")
- **Required Files:** README.md, PROPOSED_README.md, badges.yml, LICENSE, .gitignore, .github/workflows/ci.yml, .github/CONTRIBUTING.md, .github/ISSUE_TEMPLATE/bug_report.md, .github/PULL_REQUEST_TEMPLATE.md, .github/SECURITY.md, AGENTS.md.

### 7. The README Replication Protocol (Ultimate Artifact)
- **Visual Authority:** Hero Banner/Logo, Live Badges (flat-square, chirag127), Social Proof.
- **Structural Clarity:** BLUF, Architecture Diagram, Table of Contents.
- **AI Agent Directives:** Collapsible `<details>` block, Tech Stack, Patterns, Verification Commands.
- **Development Standards:** Setup, Scripts Table, Principles (SOLID, DRY, YAGNI).

### 8. Dynamic URL & Badge Protocol
- **Base URL:** `https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App`
- **Badge URLs:** All Shields.io badges must point to the Base URL or specific workflows. 
- **Consistency:** Use ONLY the new repository name in links.

### 9. Technology Stack & Verification
- **Frontend:** React Native 0.74+, Expo 51+
- **Backend:** Node.js 20.x, Express.js 4.x
- **AI Model:** Google Gemini Pro Vision API
- **Linting/Formatting:** Biome 1.7+
- **Testing:** Vitest 1.x (Unit), Playwright 1.x (E2E)
- **Verification Commands:**
    - `git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App.git`
    - `cd CogniSketch-AI-Art-Generator-Mobile-Web-App`
    - `uv sync` (or `npm install` if uv is not used directly in frontend)
    - `npx biome check --apply`
    - `npx vitest --coverage`
    - `npx playwright test`

</details>

--- 

## Development Setup

Follow these steps to get a local copy up and running.

### Prerequisites

*   Node.js (v20.x or higher)
*   npm or Yarn (v2+ recommended)
*   Expo CLI (`npm install -g expo-cli`)
*   Google Gemini API Key

### Installation

1.  **Clone the Repository:**
    bash
    git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App.git
    cd CogniSketch-AI-Art-Generator-Mobile-Web-App
    

2.  **Install Backend Dependencies:**
    bash
    cd backend
    npm install
    # Or with Yarn:
    # yarn install
    

3.  **Install Frontend Dependencies:**
    bash
    cd ../frontend
    npm install
    # Or with Yarn:
    # yarn install
    

4.  **Configure Environment Variables:**
    Create a `.env` file in the `backend` directory with your Gemini API key:
    
    GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY
    

### Running the Application

1.  **Start the Backend Server:**
    bash
    cd backend
    npm start
    # Or with Yarn:
    # yarn start
    

2.  **Start the Frontend Development Server:**
    bash
    cd ../frontend
    npx expo start
    

    This will typically open a QR code. Scan it with your Expo Go app on your device or run on an emulator/simulator.

--- 

## Project Structure

The project follows a standard monorepo structure with clear separation between backend and frontend concerns:


CogniSketch-AI-Art-Generator-Mobile-Web-App/
├── backend/                   # Express.js API server
│   ├── src/
│   ├── node_modules/
│   ├── package.json
│   ├── .env
│   └── ...
├── frontend/                 # React Native application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── navigation/
│   │   ├── App.tsx
│   │   └── ...
│   ├── node_modules/
│   ├── app.json
│   ├── package.json
│   └── ...
├── .gitignore
├── LICENSE
├── README.md
├── AGENTS.md
├── badges.yml
└── ... (GitHub workflow, etc.)


--- 

## Contributing

Contributions are welcome! Please refer to the [CONTRIBUTING.md](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/.github/CONTRIBUTING.md) file for details on our code of conduct, and the process for submitting pull requests.

--- 

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See the [LICENSE](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/LICENSE) file for more details.
