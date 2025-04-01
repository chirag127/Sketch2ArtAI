import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

class PaymentErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Payment component error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <Text style={styles.errorText}>
                        Something went wrong with the payment process.
                    </Text>
                    <Text style={styles.errorDetails}>
                        {this.state.error?.message ||
                            "An unexpected error occurred."}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={this.handleRetry}
                    >
                        <Text style={styles.retryText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: "#fff3cd",
        borderColor: "#ffeeba",
        borderWidth: 1,
        borderRadius: 8,
        margin: 10,
        alignItems: "center",
    },
    errorText: {
        color: "#856404",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
        textAlign: "center",
    },
    errorDetails: {
        color: "#856404",
        fontSize: 14,
        marginBottom: 16,
        textAlign: "center",
    },
    retryButton: {
        backgroundColor: "#007AFF",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    retryText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});

export default PaymentErrorBoundary;
