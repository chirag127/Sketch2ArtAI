# Security Policy for CogniSketch-AI-Art-Generator-Mobile-Web-App

## Vulnerability Reporting

We take the security of `CogniSketch-AI-Art-Generator-Mobile-Web-App` very seriously. If you find a security vulnerability, please report it following these steps:

1.  **DO NOT** create a public GitHub issue. This could expose the vulnerability to malicious actors.
2.  **DO NOT** disclose the vulnerability publicly until it has been resolved and a fix is available.
3.  **Email Security Team:** Send a detailed report to `chirag.dev.sec@gmail.com`. Please include:
    *   A clear and concise description of the vulnerability.
    *   Affected version(s) and component(s) of the application.
    *   Steps to reproduce the vulnerability.
    *   Proof-of-concept (if available).
    *   Your suggested remediation or mitigation, if any.
4.  **Acknowledgement:** We will acknowledge your report within **48 hours** and aim to provide a more detailed response regarding remediation status within **7 days**.
5.  **Coordinated Disclosure:** We will work with you to coordinate the public disclosure of the vulnerability after a fix has been deployed. Our primary goal is to protect our users.

## Supported Versions

We actively develop and maintain the `CogniSketch-AI-Art-Generator-Mobile-Web-App` repository on `chirag127`. Security patches are prioritized for the latest stable releases. Older versions may not receive security updates.

## Development Standards

We are committed to building secure software. Our development practices incorporate security considerations throughout the lifecycle:

*   **Tech Stack:** We utilize a modern, well-maintained stack (`React Native`, `Expo`, `TypeScript`, `Express.js`, `Google Gemini API`) and keep dependencies updated via `uv` (if applicable for backend tooling) and `npm`/`yarn` to leverage community security patches.
*   **Linting & Formatting:** Tools like `Biome` and `Ruff` are used to enforce code quality and identify potential security-related anti-patterns.
*   **Testing:** Comprehensive testing with `Vitest` (unit) and `Playwright` (E2E) includes security-focused test cases where applicable.
*   **CI/CD:** Automated checks via GitHub Actions (`ci.yml`) help catch potential issues before deployment.
*   **Secrets Management:** Sensitive information such as API keys and credentials are managed securely, never hardcoded, and ideally handled through environment variables or a dedicated secrets management service.
*   **Input Validation:** All external inputs (user-generated content, API requests) are rigorously validated and sanitized to prevent injection attacks.
*   **Dependency Auditing:** Regular audits of third-party dependencies are performed to identify and mitigate known vulnerabilities.

Thank you for helping us keep `CogniSketch-AI-Art-Generator-Mobile-Web-App` secure!