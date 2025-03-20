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
import { showAlert } from "../utils/dialog";
import AuthContext from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    const { register, isLoading } = useContext(AuthContext);

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

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async (event) => {
        // Prevent default form submission behavior
        event?.preventDefault?.();

        // Validate inputs
        if (!email || !password || !confirmPassword) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please fill in all fields");
            } else {
                Alert.alert("Error", "Please fill in all fields");
            }
            return;
        }

        if (!validateEmail(email)) {
            if (Platform.OS === "web") {
                showAlert("Error", "Please enter a valid email address");
            } else {
                Alert.alert("Error", "Please enter a valid email address");
            }
            return;
        }

        if (password.length < 6) {
            if (Platform.OS === "web") {
                showAlert(
                    "Error",
                    "Password must be at least 6 characters long"
                );
            } else {
                Alert.alert(
                    "Error",
                    "Password must be at least 6 characters long"
                );
            }
            return;
        }

        if (password !== confirmPassword) {
            if (Platform.OS === "web") {
                showAlert("Error", "Passwords do not match");
            } else {
                Alert.alert("Error", "Passwords do not match");
            }
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await register(email, password);

            if (result.success) {
                // The AuthContext will handle setting isVerifying state
                // No need to navigate manually as App.js will handle it based on isVerifying state
                console.log("Registration successful, verification required");
            } else {
                if (Platform.OS === "web") {
                    showAlert("Registration Failed", result.error);
                } else {
                    Alert.alert("Registration Failed", result.error);
                }
            }
        } catch (error) {
            console.log("Registration error:", error);
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
                    <Text style={styles.title}>Sketch2ArtAI</Text>
                    <Text style={styles.subtitle}>Create a new account</Text>

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
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
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
                        onPress={(e) => handleRegister(e)}
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>
                            Already have an account?
                        </Text>
                        <TouchableOpacity
                            onPress={(e) => {
                                e?.preventDefault?.();
                                navigation.navigate("Login");
                            }}
                        >
                            <Text style={styles.loginLink}>Login</Text>
                        </TouchableOpacity>
                    </View>
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
    },
    formContainer: {
        padding: 20,
        marginHorizontal: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        width: "100%",
        maxWidth: 450, // Limit width on larger screens
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginVertical: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginBottom: 10,
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
        marginTop: 10,
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
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 20,
    },
    loginText: {
        color: "#666",
        fontSize: 14,
    },
    loginLink: {
        color: "#4a90e2",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 5,
    },
});
