import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingOverlay = ({ message }) => (
    <View style={styles.overlay}>
        <ActivityIndicator size="large" color="#007AFF" />
        {message && <Text style={styles.message}>{message}</Text>}
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    message: {
        marginTop: 10,
        color: "#333",
        fontSize: 16,
    },
});

export default LoadingOverlay;
