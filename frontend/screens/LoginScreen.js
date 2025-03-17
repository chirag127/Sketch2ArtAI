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

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, isLoading } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await login(email, password);

            if (!result.success) {
                if (result.needsVerification) {
                    navigation.navigate("VerifyEmail");
                } else {
                    Alert.alert("Login Failed", result.error);
                }
            }
        } catch (error) {
            console.log("Login error:", error);
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
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            (isSubmitting || isLoading) &&
                                styles.disabledButton,
                        ]}
                        onPress={handleLogin}
                        disabled={isSubmitting || isLoading}
                    >
                        {isSubmitting || isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={styles.registerText}>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity
                            onPress={() => navigation.navigate("Register")}
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
});
