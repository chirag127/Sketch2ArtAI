import React, { useState, useContext, useEffect, useRef } from "react";
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
    Animated,
} from "react-native";
import PasswordInput from "../components/PasswordInput";
import AuthContext from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity for error message

    // Use memo to prevent unnecessary re-renders
    const { login, isLoading } = useContext(AuthContext);

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

    // Clear error message when user types in either field
    useEffect(() => {
        if (errorMessage) {
            setErrorMessage("");
            // Fade out animation
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [email, password]);

    // Fade in animation when error message changes
    useEffect(() => {
        if (errorMessage) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [errorMessage]);

    // Use a memoized callback to prevent unnecessary re-renders
    const handleLogin = async (event) => {
        // Prevent default form submission behavior
        if (event && event.preventDefault) {
            event.preventDefault();
        }

        // Clear any previous error messages
        setErrorMessage("");

        if (!email || !password) {
            setErrorMessage("Please enter both email and password");
            return;
        }

        setIsSubmitting(true);
        try {
            // Call the login function from AuthContext
            const result = await login(email, password);

            if (result.success) {
                // On successful login, we don't need to navigate manually
                // The AuthContext will update userToken which triggers navigation in App.js
                console.log("Login successful");

                // Set a timeout to reset isSubmitting in case the navigation doesn't happen
                setTimeout(() => {
                    setIsSubmitting(false);
                }, 3000); // 3 seconds timeout as a fallback

                return; // Exit early to keep spinner showing during navigation
            } else if (result.needsVerification) {
                // The AuthContext will handle setting isVerifying state
                // No need to navigate manually as App.js will handle it based on isVerifying state
                console.log("Email verification required");
                // Do NOT navigate here - let the App.js handle it based on state
            } else {
                // Display error message in the UI
                console.log("Login failed:", result.error);
                setErrorMessage(
                    result.error ||
                        "Login failed. Please check your credentials."
                );
            }
        } catch (error) {
            console.log("Login error:", error);
            setErrorMessage("An unexpected error occurred. Please try again.");
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
                    <Text style={styles.title}>Sketch2ArtAI</Text>
                    <Text style={styles.description}>
                        Transform your sketches into beautiful artwork using AI
                    </Text>
                    <Text style={styles.subtitle}>Login to your account</Text>

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

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <PasswordInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            style={styles.input}
                        />
                        <TouchableOpacity
                            style={styles.forgotPasswordContainer}
                            onPress={(e) => {
                                e?.preventDefault?.();
                                navigation.navigate("ForgotPassword");
                            }}
                        >
                            <Text style={styles.forgotPasswordText}>
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Error message display with animation */}
                    <Animated.View
                        style={[
                            styles.errorContainer,
                            {
                                opacity: fadeAnim,
                                height: errorMessage ? "auto" : 0,
                                overflow: "hidden",
                            },
                        ]}
                    >
                        {errorMessage ? (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        ) : null}
                    </Animated.View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            isSubmitting && styles.disabledButton,
                        ]}
                        onPress={(e) => handleLogin(e)}
                        disabled={isSubmitting}
                        activeOpacity={0.7} // Reduce flash effect on press
                    >
                        <View style={{ height: 24, justifyContent: "center" }}>
                            {isSubmitting ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>Login</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity
                            onPress={(e) => {
                                e?.preventDefault?.();
                                navigation.navigate("Register");
                            }}
                        >
                            <Text style={styles.registerLink}>Register</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        backgroundColor: "#ffebee",
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ef5350",
    },
    errorText: {
        color: "#d32f2f",
        fontSize: 14,
        textAlign: "center",
    },
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
        color: "#4a90e2",
        textAlign: "center",
        marginBottom: 15,
        fontStyle: "italic",
        paddingHorizontal: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        textAlign: "center",
        marginBottom: 30,
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
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    registerText: {
        color: "#666",
        fontSize: 14,
    },
    registerLink: {
        color: "#4a90e2",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginTop: 8,
    },
    forgotPasswordText: {
        color: "#4a90e2",
        fontSize: 14,
        fontWeight: "500",
    },
});
