# Pull Request Template

**IMPORTANT:** Please ensure all contributions adhere to the Apex Technical Authority standards and the repository's architectural principles.

--- 

## 🚀 High-Level Summary

Provide a concise, 1-2 sentence overview of the changes in this pull request. What is the primary goal or impact of this PR?

---

## 🎯 Changes Detailed

*   **Type of Change:** (e.g., Bug Fix, New Feature, Refactoring, Documentation Update, Performance Improvement, Chore)
*   **Description:** Elaborate on the specific modifications made. Detail the problem addressed and the solution implemented.
*   **Affected Areas:** List the core components, modules, or features impacted by this PR.
*   **Screenshots/Gifs (if applicable):** For UI/UX changes, visually demonstrate the outcome.

---

## 🧪 Testing & Verification

*   **Testing Strategy:** Describe how you tested your changes. Include:
    *   Manual testing steps performed.
    *   Unit/Integration tests added or modified (and their coverage).
    *   End-to-end tests executed.
    *   Relevant commands run (e.g., `npm run test`, `pytest`).
*   **Verification Commands:** Provide any specific commands a reviewer should run to verify the changes.

---

## 🧐 Architectural Alignment

*   **Adherence to Apex Standards:** Confirm that the changes align with the **Apex Technical Authority** principles and the **December 2025 / 2026 standards** outlined in `AGENTS.md`.
*   **Architectural Patterns:** Explain how the changes fit within the established architectural patterns (e.g., FSD for Frontend, Modular Monolith for Python, Hexagonal for Systems).
*   **Impact on Existing Architecture:** Detail any potential impacts or interactions with other parts of the system.

---

## 🔒 Security Review

*   **Security Considerations:** Have you considered potential security implications? Are there any new dependencies, API interactions, or data handling practices that require a security review?
*   **Refer to `SECURITY.md`:** Ensure compliance with the repository's security guidelines.

---

## 🛠️ Dependencies & Environment

*   **New Dependencies:** List any new libraries or packages added.
*   **Dependency Updates:** Note any significant updates to existing dependencies.
*   **Environment Variables:** Clarify if any new environment variables are required or if existing ones have changed.

---

## 📝 Developer Notes

*   Any additional information, context, or potential concerns that might be helpful for the reviewer.

---

**By submitting this Pull Request, you affirm that:**

1.  Your contributions adhere to the Apache 2.0 License and the "CC BY-NC" license.
2.  All tests (unit, integration, E2E) are passing.
3.  The code is formatted and linted according to project standards (Biome/Ruff).
4.  The changes have been reviewed against the `AGENTS.md` directives.
5.  The Pull Request template is filled out completely and accurately.
