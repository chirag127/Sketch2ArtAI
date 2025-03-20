import React from "react";
import { Alert, Platform } from "react-native";
import { createRoot } from "react-dom/client";

/**
 * Custom web dialog component that doesn't rely on react-native-dialog
 */
const WebDialog = ({ title, message, buttons = [], onClose }) => {
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1000,
            }}
            onClick={handleBackdropClick}
        >
            <div
                style={{
                    backgroundColor: "white",
                    borderRadius: 8,
                    padding: 20,
                    minWidth: 280,
                    maxWidth: "80%",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <h3
                        style={{
                            margin: "0 0 10px 0",
                            fontSize: 18,
                            fontWeight: "bold",
                        }}
                    >
                        {title}
                    </h3>
                )}
                {message && (
                    <p
                        style={{
                            margin: "0 0 20px 0",
                            fontSize: 16,
                            color: "#666",
                        }}
                    >
                        {message}
                    </p>
                )}
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {buttons.map((button, index) => {
                        const isDestructive = button.style === "destructive";
                        const isCancel = button.style === "cancel";

                        return (
                            <button
                                key={index}
                                onClick={() => {
                                    onClose();
                                    if (button.onPress) {
                                        button.onPress();
                                    }
                                }}
                                style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    padding: "8px 16px",
                                    marginLeft: 8,
                                    borderRadius: 4,
                                    cursor: "pointer",
                                    color: isDestructive
                                        ? "#FF3B30"
                                        : isCancel
                                        ? "#666"
                                        : "#4a90e2",
                                    fontWeight: isCancel ? "normal" : "bold",
                                    fontSize: 14,
                                }}
                            >
                                {button.text}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/**
 * Shows a dialog in a platform-specific way
 * - On web, uses a custom dialog component
 * - On native platforms, uses Alert.alert
 *
 * @param {string} title - The title of the dialog
 * @param {string} message - The message to display
 * @param {Array} buttons - Array of button objects with text and onPress properties
 * @param {Object} options - Additional options for the dialog
 */
export const showDialog = (title, message, buttons = [], options = {}) => {
    // For web platform, use our custom dialog
    if (Platform.OS === "web") {
        // Create a container for the dialog
        const container = document.createElement("div");
        document.body.appendChild(container);

        // Function to remove the dialog from the DOM
        const cleanup = () => {
            const root = createRoot(container);
            root.unmount();
            document.body.removeChild(container);
        };

        // Render the dialog using createRoot (React 18 API)
        const root = createRoot(container);
        root.render(
            <WebDialog
                title={title}
                message={message}
                buttons={buttons}
                onClose={cleanup}
            />
        );
    } else {
        // For native platforms, use Alert.alert
        Alert.alert(title, message, buttons, options);
    }
};

/**
 * Shows a confirmation dialog with OK and Cancel buttons
 *
 * @param {string} title - The title of the dialog
 * @param {string} message - The message to display
 * @param {Function} onConfirm - Function to call when OK is pressed
 * @param {Function} onCancel - Function to call when Cancel is pressed
 */
export const showConfirmDialog = (title, message, onConfirm, onCancel) => {
    const buttons = [
        { text: "Cancel", onPress: onCancel, style: "cancel" },
        { text: "OK", onPress: onConfirm },
    ];

    showDialog(title, message, buttons);
};

/**
 * Shows an alert dialog with just an OK button
 *
 * @param {string} title - The title of the dialog
 * @param {string} message - The message to display
 * @param {Function} onOk - Function to call when OK is pressed
 */
export const showAlert = (title, message, onOk) => {
    const buttons = [{ text: "OK", onPress: onOk }];

    showDialog(title, message, buttons);
};

/**
 * Shows a delete confirmation dialog
 *
 * @param {string} title - The title of the dialog
 * @param {string} message - The message to display
 * @param {Function} onDelete - Function to call when Delete is pressed
 */
export const showDeleteConfirmDialog = (title, message, onDelete) => {
    const buttons = [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: onDelete, style: "destructive" },
    ];

    showDialog(title, message, buttons);
};
