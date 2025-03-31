import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import axios from "axios";
import { API_URL } from "../env";

const AdminCreditScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchUserCredits();
    }, []);

    const fetchUserCredits = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/credits`);
            setUsers(response.data);
        } catch (error) {
            Alert.alert("Error", "Failed to fetch user credits");
            console.error("Error fetching user credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchUserCredits();
        setRefreshing(false);
    };

    const adjustCredits = async (userId, amount) => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/admin/credits/${userId}`, { amount });
            Alert.alert("Success", "Credits adjusted successfully");
            fetchUserCredits();
        } catch (error) {
            Alert.alert("Error", "Failed to adjust credits");
            console.error("Error adjusting credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const renewAllCredits = async () => {
        try {
            setLoading(true);
            await axios.post(`${API_URL}/admin/credits/renew/all`);
            Alert.alert("Success", "Credits renewed for all users");
            fetchUserCredits();
        } catch (error) {
            Alert.alert("Error", "Failed to renew credits");
            console.error("Error renewing credits:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userItem}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>
                    {item.user?.name || "Unknown User"}
                </Text>
                <Text style={styles.userEmail}>{item.user?.email}</Text>
                <Text style={styles.creditBalance}>
                    Credits: {item.balance}
                </Text>
                <Text style={styles.lastRenewal}>
                    Last Renewal:{" "}
                    {new Date(item.lastFreeCreditsDate).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.adjustCredits}>
                <TouchableOpacity
                    style={styles.creditButton}
                    onPress={() => {
                        Alert.prompt(
                            "Adjust Credits",
                            "Enter amount (use negative to deduct):",
                            [
                                { text: "Cancel", style: "cancel" },
                                {
                                    text: "OK",
                                    onPress: (amount) => {
                                        const num = parseInt(amount);
                                        if (!isNaN(num)) {
                                            adjustCredits(item.user._id, num);
                                        } else {
                                            Alert.alert(
                                                "Error",
                                                "Please enter a valid number"
                                            );
                                        }
                                    },
                                },
                            ],
                            "plain-text"
                        );
                    }}
                >
                    <Text style={styles.buttonText}>Adjust</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Credit Management</Text>
                <TouchableOpacity
                    style={styles.renewButton}
                    onPress={renewAllCredits}
                    disabled={loading}
                >
                    <Text style={styles.renewButtonText}>
                        Renew All Credits
                    </Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item) => item._id}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                contentContainerStyle={styles.list}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No users found</Text>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        padding: 16,
        backgroundColor: "#fff",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    renewButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    renewButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    list: {
        padding: 16,
    },
    userItem: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    userInfo: {
        marginBottom: 12,
    },
    userName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    creditBalance: {
        fontSize: 16,
        fontWeight: "600",
        color: "#007AFF",
        marginBottom: 4,
    },
    lastRenewal: {
        fontSize: 14,
        color: "#666",
    },
    adjustCredits: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    creditButton: {
        backgroundColor: "#007AFF",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
    },
    buttonText: {
        color: "#fff",
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#666",
        marginTop: 20,
    },
});

export default AdminCreditScreen;
