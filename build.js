const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Paths
const frontendDir = path.join(__dirname, "frontend");
const webBuildDir = path.join(frontendDir, "web-build");

// Ensure the frontend directory exists
if (!fs.existsSync(frontendDir)) {
    console.error("Frontend directory not found!");
    process.exit(1);
}

// Build process
console.log("Starting build process...");

try {
    // Navigate to frontend directory and install dependencies
    console.log("Installing frontend dependencies...");
    execSync("npm install", { cwd: frontendDir, stdio: "inherit" });

    // Build the web version
    console.log("Building web version...");
    execSync("npx expo export:web", { cwd: frontendDir, stdio: "inherit" });

    // Check if the build was successful
    if (fs.existsSync(webBuildDir)) {
        console.log("Build completed successfully!");
        console.log(`Output is in ${webBuildDir}`);
    } else {
        console.error("Build failed: web-build directory not found");
        process.exit(1);
    }
} catch (error) {
    console.error("Build failed:", error.message);
    process.exit(1);
}
