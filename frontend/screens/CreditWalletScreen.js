import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Platform,
    ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../env";
import { useAuth } from "../context/AuthContext";
import { showAlert } from "../utils/dialog";
import PaymentErrorBoundary from "../components/PaymentErrorBoundary";
import { initializeRazorpayPayment } from "../utils/razorpay";

const CreditPackages = [
    { credits: 500, amount: 100, label: "500 Credits" },
    { credits: 2500, amount: 500, label: "2500 Credits" },
    { credits: 5000, amount: 1000, label: "5000 Credits" },
];

const CreditWalletScreen = () => {
    const [credits, setCredits] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const { userInfo } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        fetchCredits();
        fetchTransactions();
    }, []);

    const fetchCredits = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/credits/balance`);
            setCredits(response.data.balance);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch credits");
            console.error("Error fetching credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            const response = await axios.get(`${API_URL}/credits/transactions`);
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            Alert.alert("Error", "Failed to fetch transaction history");
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchCredits(), fetchTransactions()]);
        setRefreshing(false);
    };

    const handlePurchase = async (creditPackage) => {
        try {
            setLoading(true);
            console.log("Creating order...");

            const orderResponse = await axios.post(`${API_URL}/credits/order`, {
                amount: creditPackage.amount,
            });

            console.log("Order created:", orderResponse.data);

            const options = {
                description: `Purchase ${creditPackage.credits} Credits`,
                image: "your_app_logo_url",
                currency: "INR",
                amount: orderResponse.data.amount,
                name: "Sketch2ArtAI",
                order_id: orderResponse.data.orderId,
                prefill: {
                    email: userInfo?.email,
                    contact: userInfo?.phone || "",
                    name: userInfo?.name || "",
                },
                theme: { color: "#007AFF" },
            };

            console.log("Initializing payment...");
            const response = await initializeRazorpayPayment(options);
            console.log("Payment response:", response);

            // Verify payment
            console.log("Verifying payment...");
            await axios.post(`${API_URL}/credits/verify`, {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
            });

            console.log("Payment verified successfully");
            showAlert(
                "Success",
                `Successfully purchased ${creditPackage.credits} credits!`
            );
            await fetchCredits();
            await fetchTransactions();
        } catch (error) {
            console.error("Purchase error:", error);
            if (error.message === "Payment cancelled by user") {
                showAlert("Cancelled", "Payment was cancelled");
            } else if (error.message?.includes("Failed to load Razorpay")) {
                showAlert(
                    "Error",
                    "Failed to initialize payment gateway. Please try again or contact support."
                );
            } else {
                showAlert(
                    "Error",
                    "Payment failed. Please try again or contact support if the issue persists."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const renderTransaction = ({ item }) => (
        <View style={styles.transactionItem}>
            <View style={styles.transactionHeader}>
                <Text style={styles.creditsText}>{item.credits} Credits</Text>
                <Text style={styles.amountText}>₹{item.amount}</Text>
            </View>
            <View style={styles.transactionDetails}>
                <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <Text
                    style={[
                        styles.statusText,
                        {
                            color:
                                item.status === "completed"
                                    ? "#4CAF50"
                                    : "#FFA000",
                        },
                    ]}
                >
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
            </View>
        </View>
    );

    const containerStyle = Platform.select({
        web: {
            maxWidth: 800,
            marginHorizontal: "auto",
            padding: 20,
        },
        default: styles.container,
    });

    return (
        <PaymentErrorBoundary>
            <ScrollView style={containerStyle}>
                <View
                    style={[
                        styles.balanceContainer,
                        Platform.OS === "web" && { marginTop: 40 },
                    ]}
                >
                    <Text style={styles.balanceTitle}>Current Balance</Text>
                    {loading ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <Text style={styles.balanceText}>
                            {credits} Credits
                        </Text>
                    )}
                </View>

                <View style={styles.purchaseContainer}>
                    <Text style={styles.sectionTitle}>Purchase Credits</Text>
                    <View
                        style={[
                            styles.packageContainer,
                            Platform.OS === "web" && {
                                maxWidth: 600,
                                marginHorizontal: "auto",
                            },
                        ]}
                    >
                        {CreditPackages.map((pkg) => (
                            <TouchableOpacity
                                key={pkg.credits}
                                style={styles.packageButton}
                                onPress={() => handlePurchase(pkg)}
                                disabled={loading}
                            >
                                <Text style={styles.packageCredits}>
                                    {pkg.label}
                                </Text>
                                <Text style={styles.packagePrice}>
                                    ₹{pkg.amount}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View
                    style={[
                        styles.historyContainer,
                        Platform.OS === "web" && {
                            maxWidth: 600,
                            marginHorizontal: "auto",
                        },
                    ]}
                >
                    <Text style={styles.sectionTitle}>Transaction History</Text>
                    <FlatList
                        data={transactions}
                        renderItem={renderTransaction}
                        keyExtractor={(item) => item._id}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        contentContainerStyle={styles.transactionList}
                        ListEmptyComponent={() => (
                            <Text style={styles.emptyText}>
                                No transactions yet
                            </Text>
                        )}
                        nestedScrollEnabled
                        scrollEnabled={false}
                    />
                </View>
            </ScrollView>
        </PaymentErrorBoundary>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    balanceContainer: {
        alignItems: "center",
        marginVertical: 20,
        padding: 20,
        backgroundColor: "#f8f9fa",
        borderRadius: 12,
    },
    balanceTitle: {
        fontSize: 18,
        color: "#666",
        marginBottom: 8,
    },
    balanceText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#007AFF",
    },
    purchaseContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    packageContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    packageButton: {
        backgroundColor: "#007AFF",
        padding: 16,
        borderRadius: 12,
        width: Platform.OS === "web" ? 280 : "48%",
        marginBottom: 12,
        marginHorizontal: Platform.OS === "web" ? 10 : 0,
        alignItems: "center",
        cursor: Platform.OS === "web" ? "pointer" : "default",
    },
    packageCredits: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 4,
    },
    packagePrice: {
        color: "#fff",
        fontSize: 14,
        opacity: 0.9,
    },
    historyContainer: {
        flex: 1,
    },
    transactionList: {
        flexGrow: 1,
    },
    transactionItem: {
        padding: 16,
        backgroundColor: "#f8f9fa",
        borderRadius: 8,
        marginBottom: 12,
    },
    transactionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    creditsText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    amountText: {
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "600",
    },
    transactionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dateText: {
        fontSize: 14,
        color: "#666",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "500",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        marginTop: 20,
    },
});

export default CreditWalletScreen;
