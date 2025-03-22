import React, { useState, useContext, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from "react-native";
import PasswordInput from "../components/PasswordInput";
import { showAlert, showConfirmDialog } from "../utils/dialog";
import AuthContext from "../context/AuthContext";

export default function ResetPasswordScreen({ navigation, route }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [localEmail, setLocalEmail] = useState("");

    const {
        resetPassword,
        forgotPassword,
        isLoading,
        verificationEmail,
        setIsVerifying,
        setIsResettingPassword,
        setVerificationEmail,
    } = useContext(AuthContext);

    // Handle email from route params and set it if verificationEmail is not set
    useEffect(() => {
        console.log("ResetPasswordScreen - route params:", route?.params);
        console.log(
            "ResetPasswordScreen - verificationEmail:",
            verificationEmail
        );

        // If email is passed via route params and verificationEmail is not set
        if (route?.params?.email && !verificationEmail) {
            console.log(
                "Setting verificationEmail from route params:",
                route.params.email
            );
            setLocalEmail(route.params.email);
            setVerificationEmail(route.params.email);
            setIsResettingPassword(true);
        }
    }, [
        route?.params,
        verificationEmail,
        setVerificationEmail,
        setIsVerifying,
    ]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && resendDisabled) {
            setResendDisabled(false);
        }
    }, [countdown, resendDisabled]);

    // Check if the device is a desktop based on screen width
    useEffect(() => {
        const updateLayout = () => {
            const { width } = Dimensions.get("window");
            setIsDesktop(width >= 768);
        };

        updateLayout();
        Dimensions.addEventListener("change", updateLayout);

        return () => {
            // Clean up event listener
            const dimensionsHandler = Dimensions.removeEventListener;
            if (dimensionsHandler) {
                dimensionsHandler("change", updateLayout);
            }
        };
    }, []);

    const handleResetPassword = async () => {
        if (!verificationCode) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please enter the verification code");
            } else {
                Alert.alert("Error", "Please enter the verification code");
            }
            return;
        }

        if (!newPassword) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please enter a new password");
            } else {
                Alert.alert("Error", "Please enter a new password");
            }
            return;
        }

        if (newPassword !== confirmPassword) {
            if (Platform.OS === "web") {
                showAlert("Error", "Passwords do not match");
            } else {
                Alert.alert("Error", "Passwords do not match");
            }
            return;
        }

        if (!verificationEmail && !localEmail) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please enter your email address");
            } else {
                Alert.alert("Error", "Please enter your email address");
            }
            return;
        }

        // If we're using localEmail, make sure to update the context
        if (!verificationEmail && localEmail) {
            console.log(
                "Setting verificationEmail from localEmail:",
                localEmail
            );
            setVerificationEmail(localEmail);
            setIsResettingPassword(true);
            // Add a small delay to ensure context is updated
            await new Promise((resolve) => setTimeout(resolve, 300));
        }

        setIsSubmitting(true);
        try {
            // Use verificationEmail if available, otherwise use localEmail
            const emailToUse = verificationEmail || localEmail;

            const result = await resetPassword(
                emailToUse,
                verificationCode,
                newPassword
            );

            if (result.success) {
                if (Platform.OS === "web") {
                    showAlert("Success", result.message, () =>
                        navigation.navigate("Login")
                    );
                } else {
                    Alert.alert("Success", result.message, [
                        {
                            text: "OK",
                            onPress: () => navigation.navigate("Login"),
                        },
                    ]);
                }
            } else {
                if (Platform.OS === "web") {
                    showAlert("Reset Failed", result.error);
                } else {
                    Alert.alert("Reset Failed", result.error);
                }
            }
        } catch (error) {
            console.log("Reset password error:", error);
            if (Platform.OS === "web") {
                showAlert(
                    "Error",
                    "An unexpected error occurred. Please try again."
                );
            } else {
                Alert.alert(
                    "Error",
                    "An unexpected error occurred. Please try again."
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!verificationEmail && !localEmail) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please enter your email address");
            } else {
                Alert.alert("Error", "Please enter your email address");
            }
            return;
        }

        // Use verificationEmail if available, otherwise use localEmail
        const emailToUse = verificationEmail || localEmail;

        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown

        try {
            const result = await forgotPassword(emailToUse);

            // If using localEmail, update the verificationEmail in context
            if (!verificationEmail && localEmail) {
                setVerificationEmail(localEmail);
                setIsResettingPassword(true);
            }

            if (result.success) {
                if (Platform.OS === "web") {
                    showAlert(
                        "Success",
                        "Reset code resent. Please check your email."
                    );
                } else {
                    Alert.alert(
                        "Success",
                        "Reset code resent. Please check your email."
                    );
                }
            } else {
                if (Platform.OS === "web") {
                    showAlert("Failed to Resend", result.error);
                } else {
                    Alert.alert("Failed to Resend", result.error);
                }
                setResendDisabled(false);
                setCountdown(0);
            }
        } catch (error) {
            console.log("Resend code error:", error);
            if (Platform.OS === "web") {
                showAlert(
                    "Error",
                    "An unexpected error occurred. Please try again."
                );
            } else {
                Alert.alert(
                    "Error",
                    "An unexpected error occurred. Please try again."
                );
            }
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    const handleCancel = () => {
        setIsResettingPassword(false);
        setVerificationEmail("");
        navigation.navigate("Login");
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View
                    style={[
                        styles.formContainer,
                        isDesktop && { maxWidth: 450 },
                    ]}
                >
                    <Text style={styles.title}>Reset Your Password</Text>
                    <Text style={styles.subtitle}>
                        {verificationEmail
                            ? `We've sent a reset code to ${verificationEmail}. Please enter the code and your new password below.`
                            : `Please enter your email, the reset code you received, and your new password below.`}
                    </Text>

                    {!verificationEmail && (
                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={localEmail}
                                onChangeText={setLocalEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    )}

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Reset Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 6-digit code"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="numeric"
                            maxLength={6}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <PasswordInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Enter new password"
                            style={styles.input}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <PasswordInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm new password"
                            style={styles.input}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (isSubmitting || isLoading) &&
                                styles.disabledButton,
                        ]}
                        onPress={handleResetPassword}
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>
                                Reset Password
                            </Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.resendContainer}>
                        <TouchableOpacity
                            onPress={handleResendCode}
                            disabled={resendDisabled}
                        >
                            <Text
                                style={[
                                    styles.resendText,
                                    resendDisabled && styles.disabledText,
                                ]}
                            >
                                {resendDisabled
                                    ? `Resend code in ${countdown}s`
                                    : "Resend reset code"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center", // Center content horizontally
        padding: 20,
    },
    formContainer: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: "100%",
        maxWidth: 450, // Limit width on larger screens
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        width: "100%",
    },
    button: {
        backgroundColor: "#4a90e2",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    disabledButton: {
        backgroundColor: "#a0c4e9",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    resendContainer: {
        alignItems: "center",
        marginTop: 20,
    },
    resendText: {
        color: "#4a90e2",
        fontSize: 14,
    },
    disabledText: {
        color: "#999",
    },
    cancelButton: {
        marginTop: 20,
        paddingVertical: 12,
        alignItems: "center",
        width: "100%",
    },
    cancelButtonText: {
        color: "#f44336",
        fontSize: 14,
        fontWeight: "500",
    },
});
