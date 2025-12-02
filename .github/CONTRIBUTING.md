# Contributing to CogniSketch-AI-Art-Generator-Mobile-Web-App

## 🚀 Introduction

Welcome to **CogniSketch-AI-Art-Generator-Mobile-Web-App**! We're thrilled you're interested in contributing to this cross-platform GenAI showcase. This project aims to transform user sketches and photos into diverse artistic styles using Google Gemini Pro Vision, built with React Native and Express.js.

Our mission is to maintain **Zero-Defect, High-Velocity, Future-Proof** development, adhering to FAANG-level standards and the wisdom of "Managing the Unmanageable." Your contributions are vital to achieving this.

## 🎯 Guiding Principles

*   **Code Quality:** Write clean, well-documented, and maintainable code. Adhere to SOLID, DRY, and YAGNI principles.
*   **Testing:** All new code must be accompanied by comprehensive unit and/or integration tests. Aim for high test coverage.
*   **Performance:** Optimize for speed and resource efficiency across both mobile and web platforms.
*   **Security:** Prioritize security in all aspects of development. Be mindful of API keys, user data, and potential vulnerabilities.
*   **Collaboration:** Engage constructively with the community. Provide clear feedback and be receptive to suggestions.

## 📝 Contribution Workflow

We follow a standard GitHub pull request workflow:

1.  **Fork the Repository:** Create your own fork of the `chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App` repository.
2.  **Clone Your Fork:** Clone your forked repository to your local machine.
    bash
    git clone https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App.git
    cd CogniSketch-AI-Art-Generator-Mobile-Web-App
    
3.  **Set Up Development Environment:**
    *   Ensure you have Node.js (LTS) and Yarn (or npm) installed.
    *   Install project dependencies:
        bash
        yarn install
        # or
        # npm install
        
    *   Refer to the `README.md` for detailed setup and development server instructions.
4.  **Create a New Branch:** Create a descriptive branch for your feature or fix.
    bash
    git checkout -b feature/your-new-feature
    # or
    git checkout -b fix/your-bug-fix
    
5.  **Make Your Changes:** Implement your changes, ensuring adherence to project standards and coding style (guided by Biome).
6.  **Test Your Changes:** Run the test suite to ensure your changes haven't introduced regressions.
    bash
    yarn test
    # or
    # npm test
    
7.  **Lint and Format:** Ensure your code passes linting and formatting checks.
    bash
    yarn lint
    yarn format
    # or
    # npm run lint
    # npm run format
    
8.  **Commit Your Changes:** Commit your changes with clear and concise commit messages.
    bash
    git commit -m "feat: Add user authentication module"
    # or
    # git commit -m "fix: Resolve issue with image rendering on Android"
    
9.  **Push to Your Fork:** Push your branch to your fork on GitHub.
    bash
    git push origin feature/your-new-feature
    
10. **Open a Pull Request:** Open a pull request against the `main` branch of the `chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App` repository.
    *   Provide a clear title and description for your PR.
    *   Reference any related issues.

## 🤝 Issue Reporting

If you find a bug or have a feature request, please check if a similar issue already exists. If not, please open a new issue using the provided templates (`.github/ISSUE_TEMPLATE/bug_report.md`).

## 🛡️ Code of Conduct

We are committed to fostering an inclusive and welcoming environment. Please review our [Code of Conduct](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/.github/CODE_OF_CONDUCT.md) (if applicable, otherwise it will be added) to understand the expected standards of behavior.

## 🛠️ Development Environment Setup

For detailed instructions on setting up your local development environment, please refer to the main [README.md](https://github.com/chirag127/CogniSketch-AI-Art-Generator-Mobile-Web-App/blob/main/README.md) file.

## 📚 Tech Stack & Architecture

This project utilizes:

*   **Frontend:** React Native (with Expo) for cross-platform mobile and web rendering.
*   **Backend:** Express.js for the API layer.
*   **AI:** Google Gemini Pro Vision API for generative AI art.
*   **Language:** TypeScript (primarily for improved code maintainability and scalability).
*   **Linting/Formatting:** Biome for ultra-fast code quality checks.
*   **Testing:** Vitest for unit and integration tests, Playwright for end-to-end testing (if applicable).

Architecture follows modern best practices for full-stack applications, emphasizing modularity and separation of concerns.

## 🌟 Thank You!

Thank you for contributing to **CogniSketch-AI-Art-Generator-Mobile-Web-App**! Your efforts help us build a high-quality, cutting-edge AI art generation platform.