# Security Policy

## Supported Versions

We actively support and provide security patches for the latest stable version of **Artifex-AI-Sketch-to-Art-CrossPlatform-App**.

## Reporting a Vulnerability

We take the security of our project seriously. If you believe you have found a security vulnerability in **Artifex-AI-Sketch-to-Art-CrossPlatform-App**, please report it to us responsibly.

**Preferred Method:**

Please submit a detailed report via a GitHub Security Advisory. This allows for private discussion and coordination before public disclosure.

1.  Navigate to the **Security** tab of the repository: [https://github.com/chirag127/Artifex-AI-Sketch-to-Art-CrossPlatform-App/security/advisories](https://github.com/chirag127/Artifex-AI-Sketch-to-Art-CrossPlatform-App/security/advisories)
2.  Click on "New advanced security advisory" or "Report a vulnerability".
3.  Provide as much of the following information as possible:
    *   A clear description of the vulnerability.
    *   The affected version(s) of the project.
    *   Steps to reproduce the vulnerability.
    *   Any proof-of-concept code or exploit details.
    *   The potential impact of the vulnerability.
    *   Your suggested mitigation or fix.

**Alternative Method:**

If you are unable to use GitHub Security Advisories, you may also send a PGP-encrypted email to `chirag.127@example.com` (replace with actual PGP key if available, otherwise use standard email with a clear subject like "Security Vulnerability Report"). Please be aware that this method might have a slightly longer response time.

## Disclosure Timeline

We will acknowledge receipt of your vulnerability report within **48 hours** and will make a reasonable effort to address it promptly. We aim to resolve validated vulnerabilities within **30 days**. A public disclosure will be coordinated with you after a fix has been deployed.

## Security Practices

*   **Dependencies:** We regularly scan and update our dependencies using tools like `npm audit` and `yarn audit` for frontend and `pip-audit` for backend Python packages. The CI pipeline (`.github/workflows/ci.yml`) includes checks for vulnerable dependencies.
*   **Code Review:** All code changes undergo a review process via Pull Requests, with a focus on security best practices.
*   **AI Model Security:** When interacting with third-party AI models like Google Gemini Pro Vision, we implement robust input validation and sanitization to prevent prompt injection or abuse.
*   **Cross-Platform Security:** For React Native and Express.js components, we adhere to OWASP Mobile Security Project and OWASP Top 10 guidelines respectively.
*   **Testing:** Comprehensive testing, including unit and potentially end-to-end tests, aims to catch regressions and security-related issues.

## Supported Environments

*   **Frontend:** React Native (iOS, Android)
*   **Backend:** Node.js / Express.js
*   **AI:** Google Gemini Pro Vision API

Thank you for helping keep **Artifex-AI-Sketch-to-Art-CrossPlatform-App** secure!
