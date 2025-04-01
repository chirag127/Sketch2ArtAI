import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { showAlert } from "../utils/dialog";

const CreditBalance = ({ credits, showBuyButton = true }) => {
    const navigation = useNavigation();

    const handleBuyCredits = () => {
        try {
            navigation.navigate("CreditWallet");
        } catch (error) {
            console.error("Navigation error:", error);
            if (Platform.OS === "web") {
                showAlert(
                    "Error",
                    "Failed to navigate to credit purchase screen"
                );
            } else {
                Alert.alert(
                    "Error",
                    "Failed to navigate to credit purchase screen"
                );
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.label}>Credits Available</Text>
                <Text style={styles.balance}>{credits}</Text>
            </View>
            {showBuyButton && (
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={handleBuyCredits}
                >
                    <Text style={styles.buyButtonText}>Buy Credits</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
        marginHorizontal: 16,
        marginVertical: 8,
    },
    balanceContainer: {
        flex: 1,
    },
    label: {
        fontSize: 14,
        color: "#666",
        marginBottom: 4,
    },
    balance: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#007AFF",
    },
    buyButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginLeft: 16,
    },
    buyButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});

export default CreditBalance;
