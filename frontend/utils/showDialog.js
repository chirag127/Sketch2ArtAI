import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import Dialog from "react-native-dialog";

/**
 * Shows a dialog in a platform-specific way
 * - On web, uses react-native-dialog
 * - On native platforms, uses Alert.alert
 *
 * @param {string} title - The title of the dialog
 * @param {string} message - The message to display
 * @param {Array} buttons - Array of button objects with text and onPress properties
 * @param {Object} options - Additional options for the dialog
 * @returns {Function} - Function to show the dialog
 */
const showDialog = (title, message, buttons = [], options = {}) => {
    // For web platform, use react-native-dialog
    if (Platform.OS === "web") {
        // Create a component that will be rendered
        const DialogComponent = ({ onDismiss }) => {
            const [visible, setVisible] = useState(true);

            const handleDismiss = () => {
                setVisible(false);
                if (onDismiss) {
                    onDismiss();
                }
            };

            // Map buttons to Dialog.Button components
            const dialogButtons = buttons.map((button, index) => {
                const handlePress = () => {
                    setVisible(false);
                    if (button.onPress) {
                        button.onPress();
                    }
                };

                return (
                    <Dialog.Button
                        key={index}
                        label={button.text}
                        onPress={handlePress}
                        color={
                            button.style === "destructive"
                                ? "#FF3B30"
                                : undefined
                        }
                        bold={button.style === "default"}
                    />
                );
            });

            return (
                <Dialog.Container
                    visible={visible}
                    onBackdropPress={handleDismiss}
                >
                    <Dialog.Title>{title}</Dialog.Title>
                    <Dialog.Description>{message}</Dialog.Description>
                    {dialogButtons}
                </Dialog.Container>
            );
        };

        // Return the component
        return DialogComponent;
    } else {
        // For native platforms, use Alert.alert
        return () => Alert.alert(title, message, buttons, options);
    }
};

export default showDialog;
