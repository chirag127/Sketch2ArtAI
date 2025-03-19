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
import AuthContext from "../context/AuthContext";

export default function ResetPasswordScreen({ navigation }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const {
        resetPassword,
        forgotPassword,
        isLoading,
        verificationEmail,
        setIsVerifying,
        setVerificationEmail,
    } = useContext(AuthContext);

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
            Alert.alert("Error", "Please enter the verification code");
            return;
        }

        if (!newPassword) {
            Alert.alert("Error", "Please enter a new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (!verificationEmail) {
            Alert.alert(
                "Error",
                "Email information is missing. Please go back to forgot password."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await resetPassword(
                verificationEmail,
                verificationCode,
                newPassword
            );

            if (result.success) {
                Alert.alert("Success", result.message, [
                    {
                        text: "OK",
                        onPress: () => navigation.navigate("Login"),
                    },
                ]);
            } else {
                Alert.alert("Reset Failed", result.error);
            }
        } catch (error) {
            console.log("Reset password error:", error);
            Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (!verificationEmail) {
            Alert.alert(
                "Error",
                "Email information is missing. Please go back to forgot password."
            );
            return;
        }

        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown

        try {
            const result = await forgotPassword(verificationEmail);

            if (result.success) {
                Alert.alert(
                    "Success",
                    "Verification code resent. Please check your email."
                );
            } else {
                Alert.alert("Failed to Resend", result.error);
                setResendDisabled(false);
                setCountdown(0);
            }
        } catch (error) {
            console.log("Resend code error:", error);
            Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
            );
            setResendDisabled(false);
            setCountdown(0);
        }
    };

    const handleCancel = () => {
        setIsVerifying(false);
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
                        We've sent a reset code to {verificationEmail}. Please
                        enter the code and your new password below.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Reset Code</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 8-character code"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            autoCapitalize="characters"
                            maxLength={8}
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
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
                                    : "Resend verification code"}
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
