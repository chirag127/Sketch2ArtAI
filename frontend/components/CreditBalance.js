import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

const CreditBalance = ({ credits, showBuyButton = true }) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            <View style={styles.balanceContainer}>
                <Text style={styles.label}>Credits Available</Text>
                <Text style={styles.balance}>{credits}</Text>
            </View>
            {showBuyButton && (
                <TouchableOpacity
                    style={styles.buyButton}
                    onPress={() => navigation.navigate("CreditWallet")}
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
