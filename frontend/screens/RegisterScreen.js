import React, { useState, useContext } from "react";
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
} from "react-native";
import AuthContext from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, isLoading } = useContext(AuthContext);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async () => {
        // Validate inputs
        if (!email || !password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await register(email, password);

            if (result.success) {
                navigation.navigate("VerifyEmail");
            } else {
                Alert.alert("Registration Failed", result.error);
            }
        } catch (error) {
            console.log("Registration error:", error);
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
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.formContainer}>
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
                        onPress={handleRegister}
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
                            onPress={() => navigation.navigate("Login")}
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
    },
    button: {
        backgroundColor: "#4a90e2",
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
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
