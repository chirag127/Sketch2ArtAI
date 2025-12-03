# CogniSketch-AI-Art-Generator-Cross-Platform-App

Transform your sketches and photos into stunning AI-generated art across diverse styles, including Anime and Watercolor. A cutting-edge cross-platform mobile and web application powered by React Native, Express.js, and Google Gemini Pro Vision.

---

## 🤖 AI AGENT DIRECTIVES

<details>
<summary>Click to reveal Agent Directives</summary>

## SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

### 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

### 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs.
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

### 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project leverages **TypeScript 6.x (Strict)**. For the frontend, we use **Vite 7 (Rolldown)** for blazing-fast builds and development. For cross-platform native applications, **Tauri v2.x** is employed for desktop and mobile targets. **WXT (Web Extension Toolkit)** is used for any browser extension functionalities.
    *   **State Management:** Adheres to **Signals** as the standardized approach for reactive state management.
    *   **Styling:** Employs **Tailwind CSS v4** for utility-first CSS.
    *   **Linting & Formatting:** Utilizes **Biome** for comprehensive, high-speed code quality checks and formatting.
    *   **Testing:** Implements **Vitest** for fast unit testing and **Playwright** for end-to-end (E2E) testing.
    *   **Architecture:** Adheres to **Feature-Sliced Design (FSD)** principles for robust and scalable frontend architecture.
    *   **Backend Integration:** Leverages **Node.js** with **Express.js** for API services. Dependency management is handled by **npm/yarn/pnpm**.
    *   **AI Integration:** Deeply integrated with **Google Gemini API** (`gemini-3-pro` by default). Prioritize modular design, clear API contracts, and robust error handling for all AI model interactions.

*   **SECONDARY SCENARIO B: SYSTEMS / PERFORMANCE (Rust / Go) - *Not applicable for this project's primary function. Reference only for potential backend microservices.***
    *   **Stack:** Rust (Cargo) or Go (Modules).
    *   **Lint:** Clippy / GolangCI-Lint.
    *   **Architecture:** Hexagonal Architecture (Ports & Adapters).

*   **TERTIARY SCENARIO C: DATA / AI / SCRIPTS (Python) - *Not applicable for this project's primary function. Reference only for data processing or AI model training scripts.***
    *   **Stack:** uv (Manager), Ruff (Linter), Pytest (Test).
    *   **Architecture:** Modular Monolith or Microservices.

---

### 4. VERIFICATION & EXECUTION COMMANDS
*   **Repository Access:** Ensure clone operations are authenticated and secure.
*   **Environment Setup:** Run `npm install` or `yarn install` (or appropriate package manager for Node.js backend) within the backend directory, and `npm install` or `yarn install` (or `pnpm install`) for the React Native frontend.
*   **Development Server:** Start the backend with `npm run dev` or `yarn dev` (from backend dir). Start the React Native app with `npx expo start` (from frontend dir).
*   **Testing Suite:** Execute comprehensive tests using `npx vitest run` for unit tests and `npx playwright test` for E2E tests.
*   **Linting & Formatting:** Enforce code quality with `npx biome check --apply` and `npx biome format --write`.
*   **AI Integration Check:** Verify Google Gemini API key is correctly configured in environment variables (`.env` file).

---

### 5. PRINCIPLES OF OPERATION
*   **SOLID:** Maintain adherence to Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion principles in all code modules.
*   **DRY:** Avoid redundant code. Abstract common logic into reusable functions or components.
*   **YAGNI:** "You Ain't Gonna Need It." Focus on delivering current requirements without over-engineering for hypothetical future needs.
*   **Configuration Management:** Utilize environment variables (`.env` files managed by `dotenv`) for all sensitive information and environment-specific settings.

</details>

---

## 🚀 Tech Stack

*   **Frontend/Mobile:** React Native, Expo, TypeScript 6.x (Strict)
*   **Web App Framework:** Vite 7 (Rolldown)
*   **Styling:** Tailwind CSS v4
*   **Backend:** Node.js, Express.js
*   **AI Engine:** Google Gemini Pro Vision (`gemini-3-pro`)
*   **Code Quality:** Biome (Linting & Formatting)
*   **Testing:** Vitest (Unit), Playwright (E2E)
*   **State Management:** Signals

---

## 🏗️ Architecture

mermaid
graph TD
    A[Client: React Native/Web App] --> B(API Gateway: Express.js)
    B --> C{AI Service: Google Gemini Pro Vision}
    B --> D[Database: e.g., PostgreSQL/MongoDB]
    A --> C

    subgraph Frontend
        A
    end

    subgraph Backend
        B
        D
    end

    subgraph AI Integration
        C
    end


---

## 🧭 Table of Contents

*   [🚀 Tech Stack](#tech-stack)
*   [🏗️ Architecture](#architecture)
*   [⚙️ Setup & Installation](#setup--installation)
*   [▶️ Running the Application](#running-the-application)
*   [🧪 Testing](#testing)
*   [✨ Code Quality & Formatting](#code-quality--formatting)
*   [🔐 Security](#security)
*   [⚖️ License](#license)
*   [⭐ Star This Repo](#star-this-repo)

---

## ⚙️ Setup & Installation

**Prerequisites:**
*   Node.js (v18+ recommended)
*   npm, yarn, or pnpm
*   Expo CLI (`npm install -g expo-cli`)
*   Google Cloud Account with Gemini API enabled

**1. Clone the Repository:**
bash
git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Cross-Platform-App
cd CogniSketch-AI-Art-Generator-Cross-Platform-App


**2. Setup Backend:
**
Navigate to the backend directory and install dependencies:
bash
cd backend
npm install # or yarn install or pnpm install


**Configure Environment Variables for Backend:**
Create a `.env` file in the `backend` directory:
dotenv
NODE_ENV=development
PORT=3000
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
# Add other necessary environment variables


**3. Setup Frontend (React Native):
**
Navigate to the frontend directory and install dependencies:
bash
cd ../frontend
npm install # or yarn install or pnpm install


**Configure Environment Variables for Frontend (if applicable):
**
Expo typically uses `app.config.js` or similar. For API keys, ensure they are securely handled, potentially injected during build or managed server-side.

---

## ▶️ Running the Application

**1. Start the Backend Server:**
From the `backend` directory:
bash
npm run dev # or yarn dev or pnpm dev


**2. Start the Frontend Application:**
From the `frontend` directory:
bash
npx expo start


Follow the on-screen instructions to run the app on an emulator/simulator or a physical device.

---

## 🧪 Testing

Ensure your `.env` files are configured for testing (e.g., using a separate test API key or mock services).

**Run Unit Tests (Frontend & Backend):**
bash
# From frontend directory
npx vitest run

# From backend directory
npm run test # or yarn test or pnpm test


**Run End-to-End (E2E) Tests:**
bash
# From frontend directory (ensure backend is running or mocked)
npx playwright test


---

## ✨ Code Quality & Formatting

This project uses **Biome** for consistent linting and formatting. Ensure your code adheres to the project's standards.

**Check Code:**
bash
# From the root directory
npx biome check --apply


**Format Code:**
bash
# From the root directory
npx biome format --write .


---

## 🔐 Security

*   **API Keys:** Never commit your `GOOGLE_API_KEY` or other sensitive credentials directly into the codebase. Use environment variables and ensure they are not exposed in the frontend bundle.
*   **Input Validation:** Sanitize and validate all user inputs on the backend to prevent injection attacks.
*   **Dependency Management:** Regularly audit and update dependencies to patch known vulnerabilities.
*   **Cross-Platform Security:** Be mindful of platform-specific security considerations for both mobile and web.

---

## ⚖️ License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)** license. See the [LICENSE](LICENSE) file for more details.

---

## ⭐ Star This Repo

If you find this project useful, please consider starring it on GitHub! Your support is greatly appreciated.

[<img src="https://img.shields.io/github/stars/chirag127/CogniSketch-AI-Art-Generator-Cross-Platform-App?style=social" alt="GitHub Stars">](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Cross-Platform-App)
