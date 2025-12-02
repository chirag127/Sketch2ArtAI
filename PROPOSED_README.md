# CogniSketch: AI-Powered Generative Art Mobile & Web Application

![Build Status](https://img.shields.io/github/actions/workflow/user/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/ci.yml?style=flat-square&logo=github)
![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=codecov)
![Tech Stack](https://img.shields.io/badge/tech-stack-TS%2C%20React%20Native%2C%20Express%2C%20Gemini-blue?style=flat-square&logo=react)
![Lint/Format](https://img.shields.io/badge/lint%2Fformat-Biome-yellow?style=flat-square&logo=biome)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-orange?style=flat-square&logo=creativecommons)
![GitHub Stars](https://img.shields.io/github/stars/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App?style=flat-square&logo=github)

[**Star ⭐ this Repo**](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App)

--- 

**CogniSketch** is a cutting-edge, cross-platform mobile and web application that transforms user sketches and photos into stunning artistic creations using the power of Google Gemini Pro Vision. 
Leveraging React Native for a unified codebase and Express.js for the backend, it offers a seamless full-stack Generative AI experience, supporting diverse artistic styles such as Anime, Watercolor, and Oil Paint.

## Table of Contents

*   [Overview](#overview)
*   [Features](#features)
*   [Architecture](#architecture)
*   [Tech Stack](#tech-stack)
*   [Getting Started](#getting-started)
*   [Development](#development)
*   [AI Agent Directives](#ai-agent-directives)
*   [Contributing](#contributing)
*   [License](#license)

---

## Overview

CogniSketch empowers users to unleash their creativity by providing an intuitive interface for generating unique AI-powered artwork. Whether starting from a simple sketch or an existing photograph, users can select from a variety of artistic styles to reimagine their input. The application is built for both mobile and web, ensuring accessibility and broad reach.

## Features

*   **Sketch-to-Art Generation:** Transform hand-drawn sketches into professional artistic outputs.
*   **Photo-to-Art Transformation:** Apply artistic styles to existing photographs.
*   **Multiple Artistic Styles:** Choose from a curated list of styles including Anime, Watercolor, Oil Paint, and more.
*   **Cross-Platform Compatibility:** Runs seamlessly on iOS, Android, and Web browsers.
*   **Google Gemini Pro Vision Integration:** Utilizes advanced AI capabilities for high-quality image generation.
*   **User-Friendly Interface:** Intuitive design for easy navigation and creative expression.

## Architecture

mermaid
graph TD
    A[User Interface (React Native)] --> B(Backend API - Express.js)
    B --> C{Google Gemini Pro Vision API}
    C --> D[Art Generation Service]
    D --> B
    B --> A
    A --> E[Local Storage / Cache]
    B --> F[Database / Cloud Storage]


## Tech Stack

*   **Frontend:** React Native (TypeScript)
*   **Backend:** Node.js (Express.js - TypeScript)
*   **AI Model:** Google Gemini Pro Vision
*   **State Management:** Context API / Zustand
*   **Styling:** Tailwind CSS (via NativeWind)
*   **DevOps/Tooling:** Vite, Biome, ESLint, Prettier, Vitest, Playwright
*   **Deployment:** Expo (EAS Build), Vercel/Netlify (Web)

## Getting Started

### Prerequisites

*   Node.js (v18+ recommended)
*   npm or Yarn
*   Expo CLI (`npm install -g expo-cli`)
*   Google Cloud Project with Gemini API enabled

### Installation

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App.git
    cd CogniSketch-AI-Art-Generator-Mobile-Web-App
    

2.  **Install Backend Dependencies:**
    bash
    cd server
    npm install
    # or
    yarn install
    

3.  **Install Frontend Dependencies:**
    bash
    cd ../client
    npm install
    # or
    yarn install
    

4.  **Configure Environment Variables:**
    Create a `.env` file in the `server/` directory with your Gemini API key:
    
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    
    For the client, configure environment variables as needed (e.g., for API endpoints).

### Running the Application

**1. Start the Backend Server:**
    bash
    cd server
    npm run dev
    # or
    yarn dev
    

**2. Start the Frontend Application:**
    bash
    cd ../client
    # For Mobile (iOS/Android simulators or devices)
    npx expo start

    # For Web
    npx expo start --web
    

## Development

### Scripts

| Script        | Description                                                                |
| :------------ | :------------------------------------------------------------------------- |
| `dev`         | Starts the development server (backend)                                    |
| `build`       | Builds the production-ready backend code                                   |
| `lint`        | Runs Biome linter and formatter                                            |
| `test`        | Runs unit and integration tests with Vitest                                |
| `e2e`         | Runs end-to-end tests with Playwright                                      |

### Principles

*   **SOLID:** Maintainable and extensible code design.
*   **DRY (Don't Repeat Yourself):** Avoid redundant code for efficiency.
*   **YAGNI (You Ain't Gonna Need It):** Focus on current requirements to avoid over-engineering.

---

<details>
<summary>🤖 AI AGENT DIRECTIVES</summary>

## 1. Identity & Prime Directive
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

## 2. Input Processing & Cognition
*   **Speech-to-Text Interpretation Protocol:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **Mandatory MCP Instrumentation:**
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

## 3. Context-Aware Apex Tech Stacks (Late 2025 Standards)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project leverages **TypeScript 6.x** with a focus on modern frameworks and libraries. Key tools include **Vite 7** (for build tooling and dev server, powered by Rolldown), **Tauri v2.x** (for cross-platform desktop applications), or **WXT** (for browser extensions). 
    *   **State Management:** Standardized **Signals** are preferred for declarative state management.
    *   **Styling:** **Tailwind CSS v4** is the standard for utility-first styling.
    *   **Lint/Format:** **Biome** is mandated for its exceptional speed and comprehensive functionality, replacing older tools like ESLint and Prettier.
    *   **Testing:** **Vitest** for unit and integration testing, and **Playwright** for end-to-end (E2E) testing. All tests must achieve a minimum of **90% code coverage**.
    *   **Architecture:** Adheres to **Feature-Sliced Design (FSD)** principles for scalable and maintainable frontend architectures.
    *   **Backend Integration:** For backend services (e.g., Node.js/Express.js), TypeScript is mandatory, with **Biome** for linting/formatting and **Vitest** for testing.

*   **SECONDARY SCENARIO: SYSTEMS / PERFORMANCE (Rust/Go) - *Not applicable for this project's primary function. Reference only for potential low-level components.***
    *   **Stack:** Rust (Cargo) or Go (Modules).
    *   **Lint:** Clippy / GolangCI-Lint.
    *   **Architecture:** Hexagonal Architecture (Ports & Adapters).

*   **TERTIARY SCENARIO: DATA / AI / SCRIPTS (Python) - *Not applicable for this project's primary function. Reference only for potential data pipelines or AI model training scripts.***
    *   **Stack:** Python 3.10+ with **uv** (package manager), **Ruff** (linter/formatter), **Pytest** (testing).
    *   **Architecture:** Modular Monolith or Microservices.

## 4. APEX NAMING CONVENTION (The "Star Velocity" Engine)
A high-performing name must instantly communicate **Product**, **Function**, **Platform**, and **Type**.

**Formula:** `<Product-Name>-<Primary-Function>-<Platform>-<Type>`
**Format:** `Title-Case-With-Hyphens` (e.g., `ChatFlow-AI-Powered-Real-Time-Chat-Web-App` or `ZenRead-Book-Reader-CLI-Tool`).

**Rules:**
1.  **Length:** 3 to 10 words.
2.  **Keywords:** MUST include high-volume terms.
3.  **Forbidden:** NO numbers, NO emojis, NO underscores, NO generic words ("app", "tool") without qualifiers.
4.  **Archival Protocol:** If `action` is "ARCHIVE", you **MUST** still generate a new name, description, and topics (e.g., `Archived-Advanced-Python-CLI-Tool`). The name must be **just as descriptive and professional** as an active repo.

## 5. README REPLICATION PROTOCOL (The Ultimate Artifact)
The README is a self-contained **Project Operating System**.

**Required Sections:**
1.  **VISUAL AUTHORITY (Above the Fold):**
    *   Hero Banner/Logo.
    *   **Live Badges** (Shields.io):
        *   **Style:** `flat-square` (MANDATORY).
        *   **User:** `chirag127` (MANDATORY).
        *   **Required Badges:** Build Status (GitHub Actions), Code Coverage (Codecov), Tech Stack (Language, Frameworks), Lint/Format (Biome/Ruff), License (CC BY-NC 4.0), GitHub Stars.
    *   **Social Proof:** "Star ⭐ this Repo" button.
2.  **STRUCTURAL CLARITY:**
    *   **BLUF:** 2-sentence value proposition.
    *   **Architecture:** ASCII `tree` or Mermaid diagram.
    *   **Table of Contents.**
3.  **🤖 AI AGENT DIRECTIVES (CRITICAL):**
    *   Must be in a collapsible `<details>` block.
    *   **Content:** Tech Stack Definition, Architectural Patterns (SOLID, DRY, YAGNI), Verification Commands.
    *   **Purpose:** Allows future agents to align immediately.
4.  **DEVELOPMENT STANDARDS:**
    *   Setup commands (`git clone` -> `npm install`).
    *   Scripts table.
    *   Principles (SOLID, DRY, YAGNI).

## 6. CHAIN OF THOUGHT (CoT) PROTOCOL
Before generating JSON, perform deep analysis in `<thinking>` block:
1.  **Audit:** Analyze repo content and purpose.
2.  **Pivot/Archive Decision:** Is it junk? If so, rename to `Archived-...`. If not, PIVOT to elite status.
3.  **Naming Strategy:** Apply `<Product>-<Function>-<Type>` formula.
4.  **Replication Protocol:** Draft the "AI Agent Directives" block.
5.  **File Generation:** Plan the content for all 11 required files (including `PROPOSED_README.md` and `badges.yml`).
6.  **Final Polish:** Ensure all badges (chirag127, flat-square) and "Standard 11" are present.
7.  **Strict Adherence:** Ensure `PROPOSED_README.md` strictly follows the `AGENTS.md` directives.

## 7. DYNAMIC URL & BADGE PROTOCOL
**Mandate:** All generated files MUST use the correct dynamic URLs based on the **New Repository Name**.

**Rules:**
1.  **Base URL:** `https://github.com/chirag127/<New-Repo-Name>`
2.  **Badge URLs:** All badges (Shields.io) must point to this Base URL or its specific workflows (e.g., `/actions/workflows/ci.yml`).
3.  **Consistency:** Never use the old/original repository name in links. Always use the new "Apex" name.
4.  **AGENTS.md Customization:** The generated `AGENTS.md` **MUST** be customized for the specific repository's technology stack (e.g., if Rust, use Rust tools; if Python, use Python tools), while retaining the core Apex principles. Do not just copy the generic template; adapt it.

</details>

## Contributing

Contributions are welcome! Please read our [CONTRIBUTING.md](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/.github/CONTRIBUTING.md) for details on how to submit pull requests.

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0). See the [LICENSE](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/LICENSE) file for details.
