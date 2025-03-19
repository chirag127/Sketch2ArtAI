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

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const { forgotPassword, isLoading, setVerificationEmail, setIsVerifying } =
        useContext(AuthContext);

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

    const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        console.log("Attempting to send reset code to:", email);
        setIsSubmitting(true);
        try {
            console.log("Calling forgotPassword function...");
            const result = await forgotPassword(email);
            console.log("forgotPassword result:", result);

            if (result.success) {
                console.log(
                    "Reset code sent successfully, navigating to ResetPassword"
                );
                // Add a small delay before navigation to prevent UI glitches
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Ensure verificationEmail is set in context
                setVerificationEmail(email);
                setIsVerifying(true);

                navigation.navigate("ResetPassword");
            } else {
                console.log("Reset code request failed:", result.error);
                Alert.alert("Request Failed", result.error);
            }
        } catch (error) {
            console.error("Forgot password error:", error);
            Alert.alert(
                "Error",
                "An unexpected error occurred. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
                bounces={false}
            >
                <View
                    style={[
                        styles.formContainer,
                        isDesktop && { maxWidth: 450 },
                    ]}
                >
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.description}>
                        Enter your email address and we'll send you a reset code
                        to reset your password.
                    </Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (isSubmitting || isLoading) &&
                                styles.disabledButton,
                        ]}
                        onPress={handleForgotPassword}
                        disabled={isSubmitting || isLoading}
                        activeOpacity={0.7} // Reduce flash effect on press
                    >
                        <View style={{ height: 24, justifyContent: "center" }}>
                            {isSubmitting || isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    Send Reset Code
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.haveCodeButton}
                        onPress={() => {
                            // Set verification email if available
                            if (email) {
                                setVerificationEmail(email);
                                setIsVerifying(true);
                            }
                            navigation.navigate("ResetPassword");
                        }}
                    >
                        <Text style={styles.haveCodeText}>
                            Already have a reset code?
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.navigate("Login")}
                    >
                        <Text style={styles.backButtonText}>Back to Login</Text>
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
        minHeight: Dimensions.get("window").height - 50, // Ensure minimum height to prevent layout shifts
    },
    formContainer: {
        padding: 20,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 40,
        width: "100%",
        maxWidth: 450, // Limit width on larger screens
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
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
        justifyContent: "center",
        marginTop: 10,
        width: "100%",
        minHeight: 50, // Fixed height to prevent layout shifts during loading state
    },
    disabledButton: {
        backgroundColor: "#a0c4e9",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 12,
        alignItems: "center",
    },
    backButtonText: {
        color: "#4a90e2",
        fontSize: 14,
        fontWeight: "500",
    },
    haveCodeButton: {
        marginTop: 15,
        paddingVertical: 10,
        alignItems: "center",
    },
    haveCodeText: {
        color: "#4a90e2",
        fontSize: 14,
        fontWeight: "500",
        textDecorationLine: "underline",
    },
});
