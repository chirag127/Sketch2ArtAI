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
} from "react-native";
import AuthContext from "../context/AuthContext";

export default function VerifyEmailScreen({ navigation }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const {
        verifyEmail,
        resendVerificationCode,
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

    const handleVerify = async () => {
        if (!verificationCode) {
            Alert.alert("Error", "Please enter the verification code");
            return;
        }

        if (!verificationEmail) {
            Alert.alert(
                "Error",
                "Email information is missing. Please go back to login."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await verifyEmail(
                verificationEmail,
                verificationCode
            );

            if (result.success) {
                Alert.alert("Success", "Email verified successfully");
            } else {
                Alert.alert("Verification Failed", result.error);
            }
        } catch (error) {
            console.log("Verification error:", error);
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
                "Email information is missing. Please go back to login."
            );
            return;
        }

        setResendDisabled(true);
        setCountdown(60); // 60 seconds cooldown

        try {
            const result = await resendVerificationCode(verificationEmail);

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
            <View style={styles.formContainer}>
                <Text style={styles.title}>Verify Your Email</Text>
                <Text style={styles.subtitle}>
                    We've sent a verification code to {verificationEmail}.
                    Please enter the code below to verify your email.
                </Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Verification Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        keyboardType="number-pad"
                        maxLength={6}
                    />
                </View>

                <TouchableOpacity
                    style={[
                        styles.button,
                        (isSubmitting || isLoading) && styles.disabledButton,
                    ]}
                    onPress={handleVerify}
                    disabled={isSubmitting || isLoading}
                >
                    {isSubmitting || isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify Email</Text>
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
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
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
        textAlign: "center",
        letterSpacing: 8,
    },
    button: {
        backgroundColor: "#4a90e2",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
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
    },
    cancelButtonText: {
        color: "#f44336",
        fontSize: 14,
        fontWeight: "500",
    },
});
