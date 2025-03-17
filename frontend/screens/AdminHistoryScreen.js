import React, { useState, useEffect, useContext, useCallback } from "react";
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { API_URL } from "../env";
import AuthContext from "../context/AuthContext";

export default function AdminHistoryScreen({ navigation }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const { userToken } = useContext(AuthContext);

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

    const fetchAdminHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/admin/history`, {
                headers: {
                    Authorization: `Bearer ${userToken}`,
                },
            });
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching admin history:", error);
            Alert.alert(
                "Error",
                "Failed to fetch admin history. Please try again."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch history when component mounts
    useEffect(() => {
        fetchAdminHistory();
    }, []);

    // Fetch history when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            console.log("Admin history screen focused - refreshing data");
            fetchAdminHistory();
        }, [])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAdminHistory();
    };

    const renderHistoryItem = ({ item }) => {
        const userEmail = item.user ? item.user.email : "Unknown User";

        return (
            <View
                style={[
                    styles.historyItem,
                    isDesktop && styles.desktopHistoryItem,
                ]}
            >
                <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                    <Text style={styles.userEmail}>User: {userEmail}</Text>
                </View>

                <View style={styles.imagesContainer}>
                    {item.originalImageUrl && (
                        <View style={styles.imageWrapper}>
                            <Text style={styles.imageLabel}>Original</Text>
                            <Image
                                source={{ uri: item.originalImageUrl }}
                                style={styles.historyImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}

                    {item.convertedImageUrl && (
                        <View style={styles.imageWrapper}>
                            <Text style={styles.imageLabel}>Converted</Text>
                            <Image
                                source={{ uri: item.convertedImageUrl }}
                                style={styles.historyImage}
                                resizeMode="contain"
                            />
                        </View>
                    )}
                </View>

                <View style={styles.detailsContainer}>
                    {item.style && (
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Style: </Text>
                            {item.style}
                        </Text>
                    )}

                    {item.prompt && (
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Prompt: </Text>
                            {item.prompt}
                        </Text>
                    )}
                </View>

                {item.responseText && (
                    <View style={styles.responseContainer}>
                        <Text style={styles.responseLabel}>AI Response:</Text>
                        <Text style={styles.responseText}>
                            {item.responseText}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin History</Text>

            {loading && !refreshing ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4a90e2" />
                    <Text style={styles.loadingText}>Loading history...</Text>
                </View>
            ) : history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No history found</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={fetchAdminHistory}
                    >
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContainer}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
        marginTop: 40,
        marginBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#666",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 18,
        color: "#666",
        marginBottom: 20,
    },
    refreshButton: {
        backgroundColor: "#4a90e2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    refreshButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 20,
    },
    historyItem: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    desktopHistoryItem: {
        flexDirection: "column",
        maxWidth: 800,
        alignSelf: "center",
        width: "100%",
    },
    historyHeader: {
        flexDirection: "column",
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
        paddingBottom: 10,
    },
    historyDate: {
        fontSize: 14,
        color: "#666",
    },
    userEmail: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#4a90e2",
        marginTop: 5,
    },
    imagesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    imageWrapper: {
        width: "48%",
    },
    imageLabel: {
        fontSize: 14,
        color: "#666",
        marginBottom: 5,
    },
    historyImage: {
        width: "100%",
        height: 150,
        borderRadius: 5,
        backgroundColor: "#f0f0f0",
    },
    detailsContainer: {
        marginBottom: 10,
    },
    detailText: {
        fontSize: 14,
        color: "#333",
        marginBottom: 5,
    },
    detailLabel: {
        fontWeight: "bold",
    },
    responseContainer: {
        backgroundColor: "#f9f9f9",
        padding: 10,
        borderRadius: 5,
    },
    responseLabel: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 5,
    },
    responseText: {
        fontSize: 14,
        color: "#333",
    },
});
