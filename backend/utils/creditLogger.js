const fs = require("fs");
const path = require("path");

const logDir = path.join(__dirname, "../logs");
const creditLogFile = path.join(logDir, "credit-operations.log");

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logCreditOperation = (userId, operation, amount, newBalance) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | User: ${userId} | Operation: ${operation} | Amount: ${amount} | New Balance: ${newBalance}\n`;

    fs.appendFile(creditLogFile, logEntry, (err) => {
        if (err) {
            console.error("Error writing to credit log:", err);
        }
    });
};

module.exports = {
    logCreditOperation,
};
